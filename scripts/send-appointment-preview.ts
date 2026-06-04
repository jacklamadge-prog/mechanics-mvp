import fs from "fs";
import path from "path";
import { appointmentEmailHtml } from "../lib/email-templates";
import { sendLeadEmail } from "../lib/leads";

const envPath = path.join(__dirname, "..", ".env.local");
for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq < 1) continue;
  process.env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
}

const data = {
  name: "Timur",
  phone: "79381450292",
  email: "jacklamadge@gmail.com",
  vehicle: "Mazda cx5",
  service: "Oil change",
};

async function main() {
  const { html, text } = appointmentEmailHtml(data);
  const result = await sendLeadEmail(
    "PREVIEW — New appointment — Timur",
    html,
    text
  );
  console.log(result);
}

main();
