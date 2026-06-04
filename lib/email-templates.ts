export function escapeHtml(text: string) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const GOLD = "#f0b429";
const GOLD_DARK = "#d4920a";
const INK = "#0c0e12";
const CARD = "#111318";
const PANEL = "#1a1f28";
const BORDER = "#2e3544";
const BADGE_BG = "#2a2418";
const MUTED = "#8491a8";
const TEXT = "#f6f7f9";

const DARK_STYLE = `
  :root { color-scheme: dark; supported-color-schemes: dark; }
  body, .body-bg { background-color: ${INK} !important; }
  .email-card, .email-card > table, .email-card td { background-color: ${CARD} !important; }
  .email-panel, .email-panel td { background-color: ${PANEL} !important; }
  .text-main { color: ${TEXT} !important; }
  .text-muted { color: ${MUTED} !important; }
  .text-gold { color: ${GOLD} !important; }
  .btn-secondary { background-color: ${PANEL} !important; color: ${GOLD} !important; border-color: ${GOLD} !important; }
  @media (prefers-color-scheme: light) {
    body, .body-bg { background-color: ${INK} !important; }
    .email-card, .email-card > table, .email-card td { background-color: ${CARD} !important; }
    .email-panel, .email-panel td { background-color: ${PANEL} !important; }
    .text-main { color: ${TEXT} !important; }
    .text-muted { color: ${MUTED} !important; }
    .text-gold { color: ${GOLD} !important; }
    h1.text-gold { color: ${GOLD} !important; }
    .btn-secondary { background-color: ${PANEL} !important; color: ${GOLD} !important; }
  }
`;

function infoRow(label: string, value: string, link?: string) {
  const valueHtml = link
    ? `<a href="${escapeHtml(link)}" style="color:${GOLD};text-decoration:none;font-weight:600;">${escapeHtml(value)}</a>`
    : `<span style="color:${TEXT};font-weight:600;">${escapeHtml(value)}</span>`;

  return `
  <tr>
    <td bgcolor="${PANEL}" style="padding:10px 0;border-bottom:1px solid ${BORDER};background-color:${PANEL};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${PANEL}" style="background-color:${PANEL};">
        <tr>
          <td width="96" valign="top" class="text-muted" style="font-size:12px;font-weight:600;color:${MUTED};text-transform:uppercase;letter-spacing:0.04em;background-color:${PANEL};">${escapeHtml(label)}</td>
          <td valign="top" class="text-main" style="font-size:15px;line-height:1.4;background-color:${PANEL};">${valueHtml}</td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function siteCardEmail(options: {
  preheader: string;
  badge: string;
  headline: string;
  subline: string;
  rows: { label: string; value: string; link?: string }[];
  primaryButton: { label: string; href: string };
  secondaryButton?: { label: string; href: string };
  footer: string;
}) {
  const rowsHtml = options.rows.map((r) => infoRow(r.label, r.value, r.link)).join("");

  const secondaryBtn = options.secondaryButton
    ? `
    <td style="padding-left:10px;">
      <a href="${escapeHtml(options.secondaryButton.href)}" class="btn-secondary" style="display:inline-block;padding:14px 20px;background-color:${PANEL};border:1px solid ${GOLD};color:${GOLD};text-decoration:none;border-radius:12px;font-size:14px;font-weight:600;">${escapeHtml(options.secondaryButton.label)}</a>
    </td>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark only" />
  <meta name="supported-color-schemes" content="dark" />
  <style type="text/css">${DARK_STYLE}</style>
</head>
<body class="body-bg" bgcolor="${INK}" style="margin:0;padding:0;background-color:${INK};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;">${escapeHtml(options.preheader)}</div>
  <table role="presentation" class="body-bg" width="100%" cellpadding="0" cellspacing="0" bgcolor="${INK}" style="background-color:${INK};padding:28px 16px;">
    <tr><td align="center" bgcolor="${INK}" style="background-color:${INK};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
        <tr>
          <td class="email-card" bgcolor="${CARD}" style="background-color:${CARD};border:1px solid ${GOLD_DARK};border-radius:16px;overflow:hidden;">
            <table role="presentation" class="email-card" width="100%" cellpadding="0" cellspacing="0" bgcolor="${CARD}" style="background-color:${CARD};">
            <!-- Gold top bar -->
            <tr><td bgcolor="${GOLD}" style="height:4px;background-color:${GOLD};font-size:0;line-height:4px;">&nbsp;</td></tr>
            <!-- Header -->
            <tr><td bgcolor="${CARD}" style="padding:20px 22px 0;background-color:${CARD};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${CARD}" style="background-color:${CARD};">
              <tr>
                <td width="48" valign="middle" bgcolor="${CARD}" style="background-color:${CARD};">
                  <div style="width:44px;height:44px;border-radius:50%;background-color:${GOLD};text-align:center;line-height:44px;font-size:15px;font-weight:800;color:${INK};">M</div>
                </td>
                <td valign="middle" bgcolor="${CARD}" style="padding-left:12px;background-color:${CARD};">
                  <p class="text-main" style="margin:0;font-size:16px;font-weight:700;color:${TEXT};">Mike&apos;s Auto Repair</p>
                  <p class="text-muted" style="margin:4px 0 0;font-size:12px;color:${MUTED};">AI Receptionist</p>
                </td>
                <td align="right" valign="middle" bgcolor="${CARD}" style="background-color:${CARD};">
                  <span style="display:inline-block;padding:5px 12px;background-color:${BADGE_BG};border:1px solid ${GOLD_DARK};border-radius:999px;font-size:10px;font-weight:700;color:${GOLD};letter-spacing:0.06em;">${escapeHtml(options.badge)}</span>
                </td>
              </tr>
            </table>
            </td></tr>
            <!-- Body -->
            <tr><td bgcolor="${CARD}" style="padding:18px 22px 8px;background-color:${CARD};">
                  <h1 class="text-gold" style="margin:0 0 6px;font-size:22px;font-weight:700;color:${GOLD};line-height:1.25;">${escapeHtml(options.headline)}</h1>
                  <p class="text-muted" style="margin:0 0 16px;font-size:14px;line-height:1.5;color:${MUTED};">${escapeHtml(options.subline)}</p>
                  <table role="presentation" class="email-panel" width="100%" cellpadding="0" cellspacing="0" bgcolor="${PANEL}" style="background-color:${PANEL};border:1px solid ${BORDER};border-radius:12px;">
                    <tr><td bgcolor="${PANEL}" style="padding:8px 16px;background-color:${PANEL};">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${PANEL}" style="background-color:${PANEL};">
                    ${rowsHtml}
                    </table>
                    </td></tr>
                  </table>
            </td></tr>
            <!-- Actions -->
            <tr><td bgcolor="${CARD}" style="padding:8px 22px 22px;background-color:${CARD};">
                  <table role="presentation" cellpadding="0" cellspacing="0" bgcolor="${CARD}" style="background-color:${CARD};">
                    <tr>
                      <td bgcolor="${CARD}" style="background-color:${CARD};">
                        <a href="${escapeHtml(options.primaryButton.href)}" style="display:inline-block;padding:14px 24px;background-color:${GOLD};color:${INK};text-decoration:none;border-radius:12px;font-size:15px;font-weight:700;">${escapeHtml(options.primaryButton.label)}</a>
                      </td>
                      ${secondaryBtn}
                    </tr>
                  </table>
            </td></tr>
            <!-- Footer -->
            <tr><td bgcolor="${CARD}" class="text-muted" style="padding:14px 22px;font-size:12px;line-height:1.5;color:${MUTED};text-align:center;background-color:${CARD};border-top:1px solid ${BORDER};">${escapeHtml(options.footer)}</td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td bgcolor="${INK}" class="text-muted" style="padding:14px 8px 0;text-align:center;font-size:11px;color:${MUTED};background-color:${INK};">ShopLine AI · Automated lead notification</td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function appointmentEmailHtml(data: {
  name: string;
  phone: string;
  email: string;
  vehicle: string;
  service: string;
}) {
  const phoneHref = `tel:${data.phone.replace(/[^\d+]/g, "")}`;
  const mailHref = `mailto:${encodeURIComponent(data.email)}?subject=${encodeURIComponent("Mike's Auto Repair — appointment confirmation")}`;

  const html = siteCardEmail({
    preheader: `${data.name} · ${data.service} · ${data.phone}`,
    badge: "NEW LEAD",
    headline: "New appointment",
    subline: "A customer booked through your AI receptionist. Contact them to confirm the visit.",
    rows: [
      { label: "Customer", value: data.name },
      { label: "Phone", value: data.phone, link: phoneHref },
      { label: "Email", value: data.email, link: mailHref },
      { label: "Vehicle", value: data.vehicle },
      { label: "Service", value: data.service },
    ],
    primaryButton: { label: `Call ${data.name}`, href: phoneHref },
    secondaryButton: { label: "Reply by email", href: mailHref },
    footer: "Tip: call within 15 minutes — customers book faster when you respond quickly.",
  });

  const text = [
    "New appointment — Mike's Auto Repair",
    "",
    `Customer: ${data.name}`,
    `Phone: ${data.phone}`,
    `Email: ${data.email}`,
    `Vehicle: ${data.vehicle}`,
    `Service: ${data.service}`,
    "",
    "Contact them to confirm the visit.",
  ].join("\n");

  return { html, text };
}

export function demoEmailHtml(data: {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
}) {
  const phoneHref = `tel:${data.phone.replace(/[^\d+]/g, "")}`;
  const mailHref = `mailto:${encodeURIComponent(data.email)}`;

  const html = siteCardEmail({
    preheader: `Demo request: ${data.businessName}`,
    badge: "DEMO",
    headline: "Demo request",
    subline: "Someone wants to see your AI receptionist. Follow up to schedule a call.",
    rows: [
      { label: "Business", value: data.businessName },
      { label: "Owner", value: data.ownerName },
      { label: "Email", value: data.email, link: mailHref },
      { label: "Phone", value: data.phone, link: phoneHref },
    ],
    primaryButton: { label: `Email ${data.ownerName}`, href: mailHref },
    secondaryButton: { label: "Call", href: phoneHref },
    footer: "Lead from your landing page contact form.",
  });

  const text = [
    "New demo request",
    "",
    `Business: ${data.businessName}`,
    `Owner: ${data.ownerName}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
  ].join("\n");

  return { html, text };
}
