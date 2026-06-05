import { NextRequest, NextResponse } from "next/server";
import {
  getNvidiaChatOptions,
  getNvidiaClient,
  getNvidiaModel,
} from "@/lib/nvidia";
import {
  appointmentThankYou,
  buildBookingAskMessage,
  extractAppointmentFromMessages,
  getMissingBookingFields,
  isInBookingFlow,
  looksLikePrematureBookingClose,
  userPrefersRussian,
} from "@/lib/appointment-extract";
import { trimChatHistory } from "@/lib/chat-helpers";
import {
  processLead,
  shouldSendAppointment,
} from "@/lib/leads";
import { RECEPTIONIST_SYSTEM_PROMPT } from "@/lib/prompts";
import { appointmentEmailHtml } from "@/lib/email-templates";

export const runtime = "nodejs";
export const maxDuration = 60;

const AI_TIMEOUT_MS = 28_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("AI request timed out")), ms)
    ),
  ]);
}

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function isLeakedToolText(text: string) {
  return /^submit_appointment$/i.test(text.trim());
}

async function sendAppointmentLead(data: {
  name: string;
  phone: string;
  email: string;
  vehicle: string;
  service: string;
}) {
  const { html, text } = appointmentEmailHtml(data);
  return processLead(
    "appointment",
    data,
    `🔧 New appointment — ${data.name} · ${data.service}`,
    html,
    text
  );
}

async function finalizeAppointment(
  data: {
    name: string;
    phone: string;
    email: string;
    vehicle: string;
    service: string;
  },
  russian: boolean
) {
  if (!(await shouldSendAppointment(data.phone))) {
    return NextResponse.json({
      message: russian
        ? "Ваша заявка уже отправлена. Мы скоро свяжемся с вами!"
        : "Your appointment was already submitted. We'll contact you soon!",
      appointmentSubmitted: true,
      emailed: true,
    });
  }

  const result = await sendAppointmentLead(data);
  const emailed = result.email.sent;
  const emailError = result.email.error;

  if (!emailed) {
    console.error("[appointment] email failed:", emailError);
  }

  const message = emailed
    ? appointmentThankYou(russian)
    : russian
      ? `Заявка сохранена, но письмо не отправилось (${emailError ?? "ошибка"}). Мы всё равно перезвоним.`
      : `Your booking was saved, but email failed (${emailError ?? "error"}). We'll still call you.`;

  return NextResponse.json({
    message,
    appointmentSubmitted: true,
    emailed,
    emailError,
  });
}

export async function POST(request: NextRequest) {
  let messages: ChatMessage[] | undefined;

  try {
    const nvidia = getNvidiaClient();
    if (!nvidia) {
      return NextResponse.json(
        { error: "NVIDIA_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    messages = body.messages as ChatMessage[] | undefined;

    if (!messages?.length) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    const history = trimChatHistory(messages, 12);
    const russian = userPrefersRussian(history);
    const complete = extractAppointmentFromMessages(history);

    // All booking info present → send email immediately (no AI, no tools)
    if (complete) {
      return finalizeAppointment(complete, russian);
    }

    const missing = getMissingBookingFields(history);
    if (isInBookingFlow(history) && missing.length > 0) {
      return NextResponse.json({
        message: buildBookingAskMessage(missing, russian, history),
        appointmentSubmitted: false,
      });
    }

    const opts = getNvidiaChatOptions();

    const completion = await withTimeout(
      nvidia.chat.completions.create({
        model: getNvidiaModel(),
        messages: [
          { role: "system", content: RECEPTIONIST_SYSTEM_PROMPT },
          ...history.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ],
        temperature: opts.temperature,
        top_p: opts.top_p,
        max_tokens: opts.max_tokens,
      }),
      AI_TIMEOUT_MS
    );

    const choice = completion.choices[0];
    let reply =
      choice.message.content?.trim() ||
      (russian
        ? "Чем могу помочь? Спросите про услуги, часы, цены или запись."
        : "How can I help? Ask about services, hours, pricing, or booking.");

    if (isLeakedToolText(reply)) {
      const retry = extractAppointmentFromMessages(history);
      if (retry) return finalizeAppointment(retry, russian);
      reply = appointmentThankYou(russian);
    }

    // User may have filled all fields across several messages
    const extracted = extractAppointmentFromMessages(history);
    if (extracted) {
      return finalizeAppointment(extracted, russian);
    }

    if (looksLikePrematureBookingClose(reply)) {
      const stillMissing = getMissingBookingFields(history);
      if (stillMissing.length > 0) {
        reply = buildBookingAskMessage(stillMissing, russian, history);
      }
    }

    return NextResponse.json({ message: reply, appointmentSubmitted: false });
  } catch (error) {
    console.error("Chat API error:", error);

    if (messages?.length) {
      const complete = extractAppointmentFromMessages(messages);
      if (complete) {
        return finalizeAppointment(complete, userPrefersRussian(messages));
      }
    }

    const msg =
      error instanceof Error && error.message.includes("timed out")
        ? "Request timed out. Please try again."
        : "Failed to process chat message";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
