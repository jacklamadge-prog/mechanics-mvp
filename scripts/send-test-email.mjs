import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Resend } from "resend";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");

function loadEnv() {
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    process.env[key] = val;
  }
}

loadEnv();

const resend = new Resend(process.env.RESEND_API_KEY);
const to = process.env.OWNER_EMAIL;
const from = process.env.FROM_EMAIL || "onboarding@resend.dev";

const { data, error } = await resend.emails.send({
  from: `Mike's Auto Repair <${from}>`,
  to,
  subject: "TEST — Mike's Auto Repair booking",
  html: "<p>If you see this, Resend works.</p>",
});

if (error) {
  console.error("FAIL", error);
  process.exit(1);
}

console.log("OK", data?.id, "→", to);
