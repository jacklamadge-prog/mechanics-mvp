import { NextRequest, NextResponse } from "next/server";
import { demoEmailHtml } from "@/lib/email-templates";
import { processLead } from "@/lib/leads";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, ownerName, email, phone } = body;

    if (!businessName?.trim() || !ownerName?.trim() || !email?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const payload = {
      businessName: businessName.trim(),
      ownerName: ownerName.trim(),
      email: email.trim(),
      phone: phone.trim(),
    };

    const { html, text } = demoEmailHtml(payload);
    const { email: emailResult } = await processLead(
      "demo",
      payload,
      `📋 Demo request — ${payload.businessName}`,
      html,
      text
    );

    return NextResponse.json({
      success: true,
      emailed: emailResult.sent,
      emailError: emailResult.error,
    });
  } catch (error) {
    console.error("Demo API error:", error);
    return NextResponse.json(
      { error: "Failed to submit demo request" },
      { status: 500 }
    );
  }
}
