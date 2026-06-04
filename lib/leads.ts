import fs from "fs/promises";
import path from "path";
import { getFromEmail, getOwnerEmail, getResend } from "@/lib/resend";

const LEADS_DIR = path.join(process.cwd(), "data");
const LEADS_FILE = path.join(LEADS_DIR, "leads.json");

export type LeadRecord = {
  type: "appointment" | "demo";
  at: string;
  emailed: boolean;
  emailError?: string;
  [key: string]: string | boolean | undefined;
};

async function readLeads(): Promise<LeadRecord[]> {
  try {
    const raw = await fs.readFile(LEADS_FILE, "utf8");
    return JSON.parse(raw) as LeadRecord[];
  } catch {
    return [];
  }
}

async function writeLeads(leads: LeadRecord[]) {
  try {
    await fs.mkdir(LEADS_DIR, { recursive: true });
    await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), "utf8");
  } catch (err) {
    console.warn("[lead storage] skipped (read-only or unavailable):", err);
  }
}

/** Send if never sent, last send failed, or last success was >10 min ago */
export async function shouldSendAppointment(phone: string) {
  const leads = await readLeads();
  const same = leads
    .filter((l) => l.type === "appointment" && l.phone === phone)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  if (!same.length) return true;

  const last = same[0];
  if (!last.emailed) return true;
  if (last.emailError) return true;

  const age = Date.now() - new Date(last.at).getTime();
  return age > 90 * 1000;
}

export async function saveLeadLocally(
  type: LeadRecord["type"],
  payload: Record<string, string>
) {
  const record: LeadRecord = {
    type,
    at: new Date().toISOString(),
    emailed: false,
    ...payload,
  };

  const leads = await readLeads();
  leads.push(record);
  await writeLeads(leads);

  console.log(`[lead saved]`, record);
  return record;
}

export async function sendLeadEmail(
  subject: string,
  html: string,
  text?: string
) {
  const resend = getResend();
  if (!resend) {
    return {
      sent: false,
      error: "RESEND_API_KEY is not set",
    };
  }

  const to = getOwnerEmail().trim();
  const from = getFromEmail().trim();

  if (!to) {
    return { sent: false, error: "OWNER_EMAIL is not set in environment" };
  }
  if (!from) {
    return { sent: false, error: "FROM_EMAIL is not set in environment" };
  }

  const fromAddress = from.includes("<")
    ? from
    : `Mike's Auto Repair <${from}>`;

  const { data, error } = await resend.emails.send({
    from: fromAddress,
    to,
    subject,
    html,
    text: text ?? undefined,
  });

  if (error) {
    console.error("[Resend error]", error, { from: fromAddress, to });
    return { sent: false, error: error.message };
  }

  console.log("[email sent]", { from: fromAddress, to, id: data?.id });
  return { sent: true, id: data?.id };
}

export async function processLead(
  type: LeadRecord["type"],
  payload: Record<string, string>,
  subject: string,
  html: string,
  text?: string
) {
  const record = await saveLeadLocally(type, payload);
  const email = await sendLeadEmail(subject, html, text);

  record.emailed = email.sent;
  if (email.error) record.emailError = email.error;

  const leads = await readLeads();
  const idx = leads.findIndex(
    (l) => l.at === record.at && l.type === record.type
  );
  if (idx >= 0) {
    leads[idx] = record;
    await writeLeads(leads);
  }

  return { record, email };
}
