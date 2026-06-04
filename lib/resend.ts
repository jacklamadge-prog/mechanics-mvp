import { Resend } from "resend";

export function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export function getOwnerEmail() {
  return process.env.OWNER_EMAIL ?? "";
}

export function getFromEmail() {
  return process.env.FROM_EMAIL ?? "";
}
