"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { IconSend } from "./Icons";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const GREETING =
  "Hi! I'm the AI receptionist for Mike's Auto Repair. How can I help you today?";

const QUICK_PROMPTS = [
  "What are your hours?",
  "Oil change price?",
  "Book an appointment",
];

const CHAT_TIMEOUT_MS = 45_000;

export default function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "assistant", content: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  async function sendText(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: controller.signal,
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? "Chat failed");

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: payload.message,
        },
      ]);
    } catch (err) {
      const isTimeout =
        err instanceof Error &&
        (err.name === "AbortError" || err.message.includes("timed out"));
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: isTimeout
            ? "Sorry, that took too long. Please send your message again."
            : "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
      inputRef.current?.focus({ preventScroll: true });
    }
  }

  function sendMessage(e: FormEvent) {
    e.preventDefault();
    sendText(input);
  }

  const showQuickPrompts =
    messages.length === 1 && !loading && messages[0].id === "welcome";

  return (
    <div className="flex flex-col overflow-hidden rounded-[1.35rem] border border-white/10 bg-ink-900/90 shadow-chat backdrop-blur-xl">
      <div className="relative flex items-center gap-3 border-b border-white/[0.06] bg-gradient-to-r from-ink-950 to-ink-900 px-5 py-4">
        <div className="relative">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-dark text-sm font-bold text-ink-950 shadow-lg shadow-gold/25">
            M
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-ink-900 bg-emerald-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-white">Mike&apos;s Auto Repair</p>
          <p className="text-xs text-ink-400">AI Receptionist · Typically replies instantly</p>
        </div>
        <span className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400 sm:inline">
          Live
        </span>
      </div>

      <div
        ref={scrollRef}
        className="chat-scroll min-h-[340px] max-h-[440px] flex-1 space-y-4 overflow-y-auto overscroll-y-contain bg-[#0a0c10] p-5 sm:max-h-[500px]"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-dark text-[10px] font-bold text-ink-950">
                M
              </div>
            )}
            <div
              className={`max-w-[82%] px-4 py-3 text-[13.5px] leading-relaxed ${
                msg.role === "user"
                  ? "rounded-2xl rounded-tr-md bg-gold text-ink-950"
                  : "rounded-2xl rounded-tl-md border border-white/[0.06] bg-ink-800/80 text-ink-100"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {showQuickPrompts && (
          <div className="flex flex-wrap gap-2 pt-1 pl-9">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendText(prompt)}
                className="rounded-full border border-gold/25 bg-gold/10 px-3.5 py-1.5 text-xs font-medium text-gold-light transition hover:border-gold/50 hover:bg-gold/20"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-dark text-[10px] font-bold text-ink-950">
              M
            </div>
            <div className="rounded-2xl rounded-tl-md border border-white/[0.06] bg-ink-800/80 px-4 py-3.5">
              <p className="mb-2 text-xs text-ink-400">One moment…</p>
              <span className="flex gap-1.5">
                <span className="h-2 w-2 animate-bounce rounded-full bg-ink-500 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-ink-500 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-ink-500" />
              </span>
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={sendMessage}
        className="flex items-center gap-2 border-t border-white/[0.06] bg-ink-950/80 p-4"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-xl border border-white/[0.08] bg-ink-900 px-4 py-3 text-sm text-white outline-none placeholder:text-ink-500 focus:border-gold/40 focus:ring-1 focus:ring-gold/30"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold text-ink-950 transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Send"
        >
          <IconSend className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
