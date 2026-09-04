import nodemailer from "nodemailer";
import { site } from "@/lib/site";
import { formatDate, formatOrderNumber, formatZar } from "@/lib/inbox/format";
import type { InvoiceDetails } from "@/lib/inbox/invoice";

export type SendEmailResult = { ok: true } | { ok: false; error: string };

export type ClientUpdateEmail = {
  to: string;
  name: string;
  company: string;
  recordId: string;
  recordLabel: string;
  statusLabel: string;
  note: string;
  invoice: InvoiceDetails | null;
};

function env(name: string) {
  return process.env[name]?.trim() || "";
}

function fromAddress() {
  return env("EMAIL_FROM") || `Techly <${site.email}>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function noteToHtml(note: string) {
  return escapeHtml(note).replaceAll("\n", "<br />");
}

export function isEmailConfigured() {
  return Boolean(env("RESEND_API_KEY") || env("SMTP_HOST"));
}

function adminInboxTo() {
  return env("ADMIN_NOTIFY_EMAIL") || env("ADMIN_EMAIL");
}

function adminBaseUrl() {
  const explicit = env("NEXT_PUBLIC_SITE_URL").replace(/\/$/, "");
  if (explicit) return explicit;
  const production = env("VERCEL_PROJECT_PRODUCTION_URL");
  if (production) return `https://${production}`;
  const preview = env("VERCEL_URL");
  if (preview) return `https://${preview}`;
  return "https://techlypc.co.za";
}

type MailPayload = {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
};

async function sendWithResend(input: MailPayload): Promise<SendEmailResult> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: [input.to],
      reply_to: input.replyTo || site.email,
      subject: input.subject,
      text: input.text,
      html: input.html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    return {
      ok: false,
      error: body.slice(0, 280) || `Resend returned ${response.status}.`,
    };
  }

  return { ok: true };
}

async function sendWithSmtp(input: MailPayload): Promise<SendEmailResult> {
  const port = Number(env("SMTP_PORT") || "587");
  const transporter = nodemailer.createTransport({
    host: env("SMTP_HOST"),
    port,
    secure: env("SMTP_SECURE") === "true" || port === 465,
    auth:
      env("SMTP_USER") && env("SMTP_PASS")
        ? { user: env("SMTP_USER"), pass: env("SMTP_PASS") }
        : undefined,
  });

  await transporter.sendMail({
    from: fromAddress(),
    to: input.to,
    replyTo: input.replyTo || site.email,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });

  return { ok: true };
}

export async function sendEmail(input: MailPayload): Promise<SendEmailResult> {
  try {
    if (env("RESEND_API_KEY")) {
      return await sendWithResend(input);
    }
    if (env("SMTP_HOST")) {
      return await sendWithSmtp(input);
    }
    return {
      ok: false,
      error:
        "Email is not configured. Add RESEND_API_KEY or SMTP_HOST in .env.local, then restart the server.",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "The email could not be sent.",
    };
  }
}

function invoiceBlock(invoice: InvoiceDetails) {
  const amount = invoice.amount ?? 0;
  const payment = invoice.paymentDetails.trim();
  return `
            <tr>
              <td style="padding:0 28px 8px;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:#12c8b0;">Invoice</td>
            </tr>
            <tr>
              <td style="padding:0 28px 20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;border:1px solid #2a2a2a;border-radius:12px;">
                  <tr>
                    <td style="padding:14px 16px 4px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#9a9a9a;">Invoice number</td>
                    <td style="padding:14px 16px 4px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#9a9a9a;text-align:right;">Date</td>
                  </tr>
                  <tr>
                    <td style="padding:0 16px 14px;font-size:15px;font-weight:700;color:#ffffff;">${escapeHtml(invoice.number)}</td>
                    <td style="padding:0 16px 14px;font-size:15px;color:#d6d6d6;text-align:right;">${escapeHtml(formatDate(new Date().toISOString()))}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding:0 16px 6px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#9a9a9a;">Description</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding:0 16px 14px;font-size:15px;line-height:1.6;color:#ffffff;">${noteToHtml(invoice.description)}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding:0 16px 6px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#9a9a9a;">Amount due</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding:0 16px 16px;font-size:22px;font-weight:700;color:#12c8b0;">${escapeHtml(formatZar(amount))}</td>
                  </tr>
                  ${
                    payment
                      ? `<tr>
                    <td colspan="2" style="padding:0 16px 6px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#9a9a9a;">Payment details</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding:0 16px 16px;font-size:14px;line-height:1.6;color:#d6d6d6;">${noteToHtml(payment)}</td>
                  </tr>`
                      : ""
                  }
                </table>
              </td>
            </tr>`;
}

export async function sendClientUpdateEmail(input: ClientUpdateEmail) {
  const note = input.note.trim();
  const resolved = input.statusLabel === "Resolved";
  const invoice =
    input.invoice &&
    input.invoice.description.trim() &&
    input.invoice.amount !== null
      ? input.invoice
      : null;
  const intro = resolved
    ? `We've marked your Techly ${input.recordLabel} as resolved.`
    : `We've updated your Techly ${input.recordLabel}.`;
  const heading = invoice ? "Invoice" : resolved ? "Resolved" : "Update";
  const subject = invoice
    ? `Techly invoice ${invoice.number}`
    : resolved
      ? `Your Techly ${input.recordLabel} has been resolved`
      : `Techly ${input.recordLabel} update: ${input.statusLabel}`;

  const text = [
    `Hi ${input.name},`,
    "",
    intro,
    "",
    `Reference: ${formatOrderNumber(input.recordId)}`,
    `Status: ${input.statusLabel}`,
    ...(note ? ["", "Message from Techly:", note] : []),
    ...(invoice
      ? [
          "",
          "Invoice",
          `Number: ${invoice.number}`,
          `Description: ${invoice.description}`,
          `Amount due: ${formatZar(invoice.amount ?? 0)}`,
          ...(invoice.paymentDetails.trim()
            ? ["Payment details:", invoice.paymentDetails]
            : []),
        ]
      : []),
    "",
    "If you have questions, reply to this email.",
    "",
    "Techly",
    site.email,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#050505;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#050505;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#111111;border:1px solid #2a2a2a;border-radius:16px;">
            <tr>
              <td style="padding:28px 28px 8px;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:#12c8b0;">Techly</td>
            </tr>
            <tr>
              <td style="padding:0 28px 12px;font-size:22px;font-weight:700;color:#ffffff;">${escapeHtml(heading)}</td>
            </tr>
            <tr>
              <td style="padding:0 28px 20px;font-size:15px;line-height:1.6;color:#d6d6d6;">
                Hi ${escapeHtml(input.name)},<br /><br />
                ${escapeHtml(intro)}<br /><br />
                Reference <strong style="color:#ffffff;">${escapeHtml(formatOrderNumber(input.recordId))}</strong>
                ${input.company ? ` for ${escapeHtml(input.company)}` : ""}.
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;border:1px solid #2a2a2a;border-radius:12px;">
                  <tr>
                    <td style="padding:14px 16px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#9a9a9a;">Status</td>
                  </tr>
                  <tr>
                    <td style="padding:0 16px 14px;font-size:16px;font-weight:700;color:#12c8b0;">${escapeHtml(input.statusLabel)}</td>
                  </tr>
                  ${
                    note
                      ? `<tr>
                    <td style="padding:0 16px 6px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#9a9a9a;">Message from Techly</td>
                  </tr>
                  <tr>
                    <td style="padding:0 16px 16px;font-size:15px;line-height:1.6;color:#ffffff;">${noteToHtml(note)}</td>
                  </tr>`
                      : ""
                  }
                </table>
              </td>
            </tr>
            ${invoice ? invoiceBlock(invoice) : ""}
            <tr>
              <td style="padding:0 28px 28px;font-size:14px;line-height:1.6;color:#9a9a9a;">
                If you have questions, reply to this email.<br />
                ${escapeHtml(site.email)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return sendEmail({
    to: input.to,
    subject,
    text,
    html,
  });
}

export type AdminInboxAlert = {
  kind: "ticket" | "contact" | "follow_up";
  recordId: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  summary: string;
  details: string;
  urgency?: string;
};

export async function notifyAdminInbox(alert: AdminInboxAlert) {
  const to = adminInboxTo();
  if (!to) {
    return { ok: false as const, error: "ADMIN_EMAIL is not set." };
  }

  const titles = {
    ticket: "New support ticket",
    contact: "New Contact us request",
    follow_up: "Client follow-up on a ticket",
  } as const;
  const title = titles[alert.kind];
  const path =
    alert.kind === "contact"
      ? `/admin/contacts/${encodeURIComponent(alert.recordId)}`
      : `/admin/tickets/${encodeURIComponent(alert.recordId)}`;
  const href = `${adminBaseUrl()}${path}`;

  const text = [
    title,
    "",
    `${alert.name}${alert.company ? ` · ${alert.company}` : ""}`,
    `Email: ${alert.email}`,
    `Phone: ${alert.phone}`,
    ...(alert.urgency ? [`Urgency: ${alert.urgency}`] : []),
    `Reference: ${formatOrderNumber(alert.recordId)}`,
    "",
    alert.summary,
    "",
    alert.details,
    "",
    `Open in admin: ${href}`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#050505;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#050505;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#111111;border:1px solid #2a2a2a;border-radius:16px;">
            <tr>
              <td style="padding:28px 28px 8px;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:#12c8b0;">Techly Admin</td>
            </tr>
            <tr>
              <td style="padding:0 28px 12px;font-size:22px;font-weight:700;color:#ffffff;">${escapeHtml(title)}</td>
            </tr>
            <tr>
              <td style="padding:0 28px 20px;font-size:15px;line-height:1.6;color:#d6d6d6;">
                ${escapeHtml(alert.name)}${alert.company ? ` · ${escapeHtml(alert.company)}` : ""}<br />
                ${escapeHtml(alert.email)} · ${escapeHtml(alert.phone)}
                ${alert.urgency ? `<br />Urgency: ${escapeHtml(alert.urgency)}` : ""}
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;border:1px solid #2a2a2a;border-radius:12px;">
                  <tr>
                    <td style="padding:14px 16px 6px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#9a9a9a;">${escapeHtml(formatOrderNumber(alert.recordId))}</td>
                  </tr>
                  <tr>
                    <td style="padding:0 16px 10px;font-size:16px;font-weight:700;color:#ffffff;">${escapeHtml(alert.summary)}</td>
                  </tr>
                  <tr>
                    <td style="padding:0 16px 16px;font-size:15px;line-height:1.6;color:#d6d6d6;">${noteToHtml(alert.details)}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 28px;">
                <a href="${escapeHtml(href)}" style="display:inline-block;background:#12c8b0;color:#050505;text-decoration:none;font-weight:700;font-size:14px;padding:12px 18px;border-radius:999px;">Open in admin</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return sendEmail({
    to,
    subject: `Techly: ${title} — ${alert.name}`,
    text,
    html,
    replyTo: alert.email,
  });
}
