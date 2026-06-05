type Msg = { role: string; content: string };

export type AppointmentData = {
  name: string;
  phone: string;
  /** Optional — only if the customer volunteers it */
  email: string;
  vehicle: string;
  service: string;
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

const CAR_BRANDS =
  /^(mazda|toyota|honda|ford|bmw|mercedes|audi|nissan|chevrolet|lexus|hyundai|kia|volkswagen|vw|subaru|jeep|dodge|ram|gmc|cadillac|porsche|tesla|lada|ваз|газ)$/i;

function stripToken(token: string) {
  return token.replace(/^[^A-Za-zА-Яа-яЁё0-9+]+|[^A-Za-zА-Яа-яЁё0-9_-]+$/g, "");
}

function isCarBrand(word: string) {
  return CAR_BRANDS.test(word);
}

/** Words that look like names but aren't (booking phrases, filler, etc.) */
const NOT_A_NAME =
  /^(book|schedule|appointment|appointments|yes|yeah|yep|sure|ok|okay|please|need|want|hello|hi|hey|thanks|thank|help|quote|price|hours|open|closed|when|what|how|can|could|would|the|and|for|with|my|me|you|an|make|get|da|да|нет|no|запис|прием|приём|хочу|надо|нужно|сколько|когда|масло|oil|brake|tire|change|service|repair|shop|auto|car)$/i;

function isLikelyPersonName(word: string): boolean {
  if (!/^[A-Za-zА-Яа-яЁё]{2,24}$/i.test(word)) return false;
  if (isCarBrand(word)) return false;
  if (detectService(word)) return false;
  if (NOT_A_NAME.test(word)) return false;
  return true;
}

function detectService(text: string): string {
  const t = text.toLowerCase();
  if (/oil|масл|replace oil|change oil|замен/i.test(t)) return "Oil change";
  if (/brake|тормоз|pad/i.test(t)) return "Brake repair";
  if (/diagnostic|диагност/i.test(t)) return "Diagnostics";
  if (/tire|шин|колес/i.test(t)) return "Tire service";
  if (/battery|аккумулятор/i.test(t)) return "Battery replacement";
  return "";
}

function detectVehicle(text: string): string {
  const m = text.match(
    /\b(mazda|toyota|honda|ford|bmw|mercedes|audi|nissan|chevrolet|lexus|hyundai|kia|volkswagen|vw|subaru|jeep|dodge|ram|gmc|cadillac|porsche|tesla|lada|ваз|газ)\s*([a-z0-9\s-]{0,15})/i
  );
  if (m) {
    let rest = (m[2] ?? "").trim();
    for (const word of ["oil", "brake", "tire", "battery", "diagnostic"]) {
      const idx = rest.toLowerCase().indexOf(word);
      if (idx > 0) rest = rest.slice(0, idx).trim();
    }
    return `${capitalize(m[1])} ${rest}`.trim();
  }

  const parts = text.split(/[,;]+/).map((p) => p.trim());
  for (const p of parts) {
    if (
      /^[a-zA-Z]{3,12}\s*[a-zA-Z0-9-]{0,10}$/i.test(p) &&
      !p.includes("@") &&
      !/^\d+$/.test(p) &&
      !detectService(p)
    ) {
      return p;
    }
  }
  return "";
}

function isBookingPhraseOnly(text: string): boolean {
  const t = text.trim();
  if (/[\n,;]/.test(t)) return false;
  if (/^(book|schedule|make)\s+(an?\s+)?appoint/i.test(t)) {
    return t.split(/\s+/).filter(Boolean).length <= 4;
  }
  if (/^(записаться|запись|хочу записаться)$/i.test(t)) return true;
  return false;
}

function detectName(text: string, email?: string, phone?: string): string {
  const trimmed = text.trim();
  if (isBookingPhraseOnly(trimmed)) return "";

  const explicit = text.match(
    /(?:меня зовут|зовут|my name is|i'?m|name is|i am)\s+([A-Za-zА-Яа-яЁё][A-Za-zА-Яа-яЁё\s'-]{1,28})/i
  )?.[1];
  if (explicit) {
    const first = explicit.trim().split(/\s+/)[0] ?? "";
    if (isLikelyPersonName(first)) {
      return explicit.replace(/\s+(мой|my|номер|phone).*$/i, "").trim();
    }
  }

  const commaParts = text.split(/[,;]+/).map((p) => p.trim()).filter(Boolean);
  if (commaParts.length >= 2) {
    const first = commaParts[0].replace(/[^A-Za-zА-Яа-яЁё\s'-]/g, "").trim();
    const firstWord = first.split(/\s+/)[0] ?? "";
    if (isLikelyPersonName(firstWord) && !detectService(first)) {
      return capitalize(firstWord);
    }
  }

  for (const raw of text.split(/\s+/).filter(Boolean)) {
    const token = stripToken(raw);
    if (!token || token === email || token === phone) continue;
    if (/@/.test(token) || /^\d+$/.test(token)) continue;
    if (isLikelyPersonName(token)) return capitalize(token);
  }

  for (const p of commaParts) {
    if (p === email || p === phone) continue;
    const clean = p.replace(/[^A-Za-zА-Яа-яЁё\s'-]/g, "").trim();
    const first = clean.split(/\s+/)[0] ?? "";
    if (isLikelyPersonName(first) && !p.includes("@")) {
      return capitalize(first);
    }
  }

  const firstComma = text.match(/^([A-Za-zА-Яа-яЁё]{2,24})\s*,/);
  if (firstComma && isLikelyPersonName(firstComma[1])) {
    return capitalize(firstComma[1]);
  }

  return "";
}

/** Prefer the user message that actually contains contact details */
function bookingDetailText(messages: Msg[]): string {
  const users = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content.trim())
    .filter(Boolean);

  const rich = [...users]
    .reverse()
    .find((c) => /@/.test(c) || /\b\d{10,15}\b/.test(c));

  return rich ?? users[users.length - 1] ?? users.join("\n");
}

function userMessageTexts(messages: Msg[]): string[] {
  return messages
    .filter((m) => m.role === "user")
    .map((m) => m.content.trim())
    .filter(Boolean);
}

/** Scan each user turn — fields spread across messages are merged */
function collectBookingFields(messages: Msg[]) {
  const users = userMessageTexts(messages);
  const userOnly = users.join("\n");

  let phone = "";
  let email = "";
  for (const c of [...users].reverse()) {
    if (!phone) phone = c.match(/\b\d{10,15}\b/)?.[0] ?? "";
    if (!email) {
      email =
        c.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0] ?? "";
    }
  }
  phone = phone || userOnly.match(/\b\d{10,15}\b/)?.[0] ?? "";
  email =
    email ||
    userOnly.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0] ||
    "";

  let name = "";
  let vehicle = "";
  let service = "";
  for (const c of users) {
    if (!name) name = detectName(c, email, phone);
    if (!vehicle) vehicle = detectVehicle(c);
    if (!service) service = detectService(c);
  }
  vehicle = vehicle || detectVehicle(userOnly);
  service = service || detectService(userOnly);

  return { name, phone, email, vehicle, service, userOnly };
}

export function extractAppointmentFromMessages(
  messages: Msg[]
): AppointmentData | null {
  const { name, phone, email, vehicle, service: detectedService, userOnly } =
    collectBookingFields(messages);
  let service = detectedService;

  if (
    !service &&
    phone &&
    name &&
    vehicle &&
    /book|appointment|запис|приём/i.test(userOnly)
  ) {
    service = "General appointment";
  }

  if (!phone || !name || !vehicle || !service) return null;

  return {
    name,
    phone,
    email: email ?? "",
    vehicle,
    service,
  };
}

export type BookingField = "name" | "phone" | "vehicle" | "service";

export function hasBookingIntent(text: string): boolean {
  return (
    /book|appointment|schedule|запис|приём|прием/i.test(text) ||
    (/\b(need|want|надо|хочу)\b/i.test(text) && !!detectService(text)) ||
    /\b(change oil|oil change)\b/i.test(text)
  );
}

/** User is trying to book (not just asking price) */
export function userAffirmedBooking(messages: Msg[]): boolean {
  const reversed = [...messages].reverse();
  for (let i = 0; i < reversed.length; i++) {
    if (reversed[i].role !== "user") continue;
    const text = reversed[i].content.trim();
    if (!/^(yes|yeah|yep|sure|ok|okay|please|da|да|давай|конечно)$/i.test(text)) {
      break;
    }
    const prevAssistant =
      reversed.slice(i + 1).find((m) => m.role === "assistant")?.content ?? "";
    if (/book|appointment|schedule|запис|would you like/i.test(prevAssistant)) {
      return true;
    }
    break;
  }
  return false;
}

export function assistantAskedForBookingDetails(messages: Msg[]): boolean {
  const lastAssistant =
    [...messages].reverse().find((m) => m.role === "assistant")?.content ?? "";
  return /name.*phone|phone.*vehicle|book your appointment|provide me with|please send|still need|got it|пришлите|имя.*телефон|could you please provide|to book your appointment/i.test(
    lastAssistant
  );
}

export function userWantsToBookNow(messages: Msg[]): boolean {
  const users = messages.filter((m) => m.role === "user").map((m) => m.content);
  const last = users[users.length - 1] ?? "";
  const all = users.join("\n");

  if (userAffirmedBooking(messages)) return true;

  if (/book an appointment|schedule an appointment|make an appointment|записаться/i.test(last)) {
    return true;
  }

  if (/how much|price|cost|\$|quote|стоим|цена/i.test(last) && !/book|schedule/i.test(last)) {
    return false;
  }

  const serviceMentions = users.filter((c) => detectService(c)).length;
  if (serviceMentions >= 2 && detectService(last) && /\b(need|want|надо|хочу)\b/i.test(last)) {
    return true;
  }

  if (/\b(book|schedule)\b/i.test(last) && detectService(all)) return true;

  return false;
}

/** Collecting booking fields — skip AI confirm until name, phone, vehicle, service are present */
export function isInBookingFlow(messages: Msg[]): boolean {
  if (userWantsToBookNow(messages)) return true;
  if (assistantAskedForBookingDetails(messages)) return true;

  const missing = getMissingBookingFields(messages);
  if (missing.length > 0 && missing.length < 4) {
    const userText = messages
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .join("\n");
    if (
      userAffirmedBooking(messages) ||
      assistantAskedForBookingDetails(messages) ||
      hasBookingIntent(userText) ||
      messages.some(
        (m) => m.role === "assistant" && /book|appointment|запис/i.test(m.content)
      )
    ) {
      return true;
    }
  }

  return false;
}

export function getMissingBookingFields(messages: Msg[]): BookingField[] {
  const { name, phone, vehicle, service } = collectBookingFields(messages);

  const missing: BookingField[] = [];
  if (!name) missing.push("name");
  if (!phone) missing.push("phone");
  if (!vehicle) missing.push("vehicle");
  if (!service) missing.push("service");
  return missing;
}

export function buildBookingAskMessage(
  missing: BookingField[],
  russian: boolean,
  messages?: Msg[]
): string {
  const en: Record<BookingField, string> = {
    name: "your name",
    phone: "phone number",
    vehicle: "vehicle (make & model)",
    service: "service needed",
  };
  const ru: Record<BookingField, string> = {
    name: "имя",
    phone: "телефон",
    vehicle: "авто (марка и модель)",
    service: "услуга",
  };
  const labels = russian ? ru : en;
  const list = missing.map((f) => labels[f]).join(", ");

  let name = "";
  if (messages) {
    name = collectBookingFields(messages).name;
  }

  if (name && !missing.includes("name")) {
    if (russian) {
      return `${name}, принято. Ещё нужно: ${list}. Пример: 79381450292, Mazda CX-5`;
    }
    return `${name}, got it. Still need: ${list}. Example: 5551234567, Mazda CX-5`;
  }

  if (russian) {
    return `Чтобы записать вас, пришлите: ${list}. Пример: Тимур, 79381450292, Mazda CX-5, замена масла`;
  }
  return `To book your appointment, please send: ${list}. Example: Timur, 5551234567, Mazda CX-5, oil change`;
}

export function looksLikeBookingConfirmation(text: string) {
  return /submitted|confirmed|successfully|заявк|запис|принят|свяжем|подтверж/i.test(
    text
  );
}

/** AI said "we have everything" without real data */
export function looksLikePrematureBookingClose(text: string) {
  return (
    /collected all|have your information|will contact you soon|contact you soon|all the necessary|everything (we|i) need|shop will contact|собрал|свяжемся|вс[её] данн/i.test(
      text
    ) ||
    /booking is confirmed|appointment is confirmed|your booking is confirmed|booking'?s confirmed|we'll contact you|we will contact you/i.test(
      text
    )
  );
}

export function userPrefersRussian(messages: Msg[]) {
  return messages.some((m) => m.role === "user" && /[а-яё]/i.test(m.content));
}

export function appointmentThankYou(russian: boolean) {
  return russian
    ? "Спасибо! Заявка принята. Мы скоро свяжемся с вами для подтверждения записи."
    : "Thank you! Your appointment is booked. We'll contact you shortly to confirm.";
}
