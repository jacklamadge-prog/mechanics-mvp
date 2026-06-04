type Msg = { role: string; content: string };

export type AppointmentData = {
  name: string;
  phone: string;
  email: string;
  vehicle: string;
  service: string;
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
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

function detectName(text: string, email?: string, phone?: string): string {
  const explicit = text.match(
    /(?:меня зовут|зовут|my name is|i'?m|name is|i am)\s+([A-Za-zА-Яа-яЁё][A-Za-zА-Яа-яЁё\s'-]{1,28})/i
  )?.[1];
  if (explicit) {
    return explicit.replace(/\s+(мой|my|номер|phone).*$/i, "").trim();
  }

  for (const token of text.split(/\s+/).filter(Boolean)) {
    if (token === email || token === phone) continue;
    if (/@/.test(token) || /^\d+$/.test(token)) continue;
    if (/^[A-Za-zА-Яа-яЁё]{2,24}$/i.test(token)) return capitalize(token);
  }

  const parts = text.split(/[,;]+/).map((p) => p.trim());
  for (const p of parts) {
    if (p === email || p === phone) continue;
    if (/^[A-Za-zА-Яа-яЁё]{2,24}$/.test(p)) return capitalize(p);
    if (/^[A-Za-zА-Яа-яЁё]{2,24}\s/.test(p) && !p.includes("@")) {
      const first = p.split(/\s+/)[0];
      if (first.length >= 2) return capitalize(first);
    }
  }

  const firstComma = text.match(/^([A-Za-zА-Яа-яЁё]{2,24})\s*,/);
  if (firstComma) return capitalize(firstComma[1]);

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

export function extractAppointmentFromMessages(
  messages: Msg[]
): AppointmentData | null {
  const userOnly = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join("\n");
  const full = userOnly || messages.map((m) => m.content).join("\n");
  const detail = bookingDetailText(messages) || full;

  const email =
    detail.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0] ??
    full.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0];
  const phone =
    detail.match(/\b\d{10,15}\b/)?.[0] ?? full.match(/\b\d{10,15}\b/)?.[0];
  let service = detectService(detail) || detectService(full);
  const vehicle = detectVehicle(detail) || detectVehicle(full);
  const name = detectName(detail, email, phone) || detectName(full, email, phone);

  if (
    !service &&
    email &&
    phone &&
    name &&
    vehicle &&
    /book|appointment|запис|приём/i.test(full)
  ) {
    service = "General appointment";
  }

  if (!email || !phone || !name || !vehicle || !service) return null;

  return {
    name,
    phone,
    email,
    vehicle,
    service,
  };
}

export type BookingField = "name" | "phone" | "email" | "vehicle" | "service";

export function hasBookingIntent(text: string): boolean {
  return (
    /book|appointment|schedule|запис|приём|прием/i.test(text) ||
    (/\b(need|want|надо|хочу)\b/i.test(text) && !!detectService(text)) ||
    /\b(change oil|oil change)\b/i.test(text)
  );
}

/** User is trying to book (not just asking price) */
export function userWantsToBookNow(messages: Msg[]): boolean {
  const users = messages.filter((m) => m.role === "user").map((m) => m.content);
  const last = users[users.length - 1] ?? "";
  const all = users.join("\n");

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

export function getMissingBookingFields(messages: Msg[]): BookingField[] {
  const userOnly = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join("\n");
  const detail = bookingDetailText(messages) || userOnly;

  const email = detail.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0];
  const phone = detail.match(/\b\d{10,15}\b/)?.[0];
  const service = detectService(detail) || detectService(userOnly);
  const vehicle = detectVehicle(detail) || detectVehicle(userOnly);
  const name = detectName(detail, email, phone) || detectName(userOnly, email, phone);

  const missing: BookingField[] = [];
  if (!name) missing.push("name");
  if (!phone) missing.push("phone");
  if (!email) missing.push("email");
  if (!vehicle) missing.push("vehicle");
  if (!service) missing.push("service");
  return missing;
}

export function buildBookingAskMessage(
  missing: BookingField[],
  russian: boolean
): string {
  const en: Record<BookingField, string> = {
    name: "your name",
    phone: "phone number",
    email: "email",
    vehicle: "vehicle (make & model)",
    service: "service needed",
  };
  const ru: Record<BookingField, string> = {
    name: "имя",
    phone: "телефон",
    email: "email",
    vehicle: "авто (марка и модель)",
    service: "услуга",
  };
  const labels = russian ? ru : en;
  const list = missing.map((f) => labels[f]).join(", ");

  if (russian) {
    return `Чтобы записать вас, пришлите: ${list}. Пример: Тимур, 79381450292, you@email.com, Mazda CX-5, замена масла`;
  }
  return `To book your appointment, please send: ${list}. Example: Timur, 5551234567, you@email.com, Mazda CX-5, oil change`;
}

export function looksLikeBookingConfirmation(text: string) {
  return /submitted|confirmed|successfully|заявк|запис|принят|свяжем|подтверж/i.test(
    text
  );
}

/** AI said "we have everything" without real data */
export function looksLikePrematureBookingClose(text: string) {
  return /collected all|have your information|will contact you soon|contact you soon|all the necessary|everything (we|i) need|shop will contact|собрал|свяжемся|вс[её] данн/i.test(
    text
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
