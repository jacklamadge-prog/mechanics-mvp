type ChatMessage = { role: string; content: string };

const BOOKING_RE =
  /appoint|book|schedule|запис|заявк|замен|масл|oil|brake|тормоз|tire|шин|diagnostic|диагност|service|ремонт|хочу|нужно|need|want|email|@|телефон|phone|\d{7,}/i;

/** Tools slow the API — only when booking / collecting contact info */
export function shouldUseAppointmentTools(messages: ChatMessage[]): boolean {
  const userTexts = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join("\n");

  if (BOOKING_RE.test(userTexts)) return true;

  const lastAssistant = [...messages]
    .reverse()
    .find((m) => m.role === "assistant")?.content;
  if (
    lastAssistant &&
    /email|почт|phone|телефон|vehicle|машин|модел|марка/i.test(lastAssistant)
  ) {
    return true;
  }

  return false;
}

/** Keep last N messages so API stays fast */
export function trimChatHistory<T extends ChatMessage>(
  messages: T[],
  max = 8
): T[] {
  if (messages.length <= max) return messages;
  const first = messages[0];
  const rest = messages.slice(-(max - 1));
  return [first, ...rest];
}
