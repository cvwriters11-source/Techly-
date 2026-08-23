import nodemailer from "nodemailer";
import { site } from "@/lib/site";
import { formatDate, formatZar } from "@/lib/inbox/format";
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

async function sendWithResend(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<SendEmailResult> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: [input.to],
      reply_to: site.email,
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

async function sendWithSmtp(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<SendEmailResult> {
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
    replyTo: site.email,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });

  return { ok: true };
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<SendEmailResult> {
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
  const invoice =
    input.invoice &&
    input.invoice.description.trim() &&
    input.invoice.amount !== null
      ? input.invoice
      : null;
  const subject = invoice
    ? `Techly invoice ${invoice.number}`
    : `Techly ${input.recordLabel} update: ${input.statusLabel}`;

  const text = [
    `Hi ${input.name},`,
    "",
    `We've updated your Techly ${input.recordLabel}.`,
    "",
    `Reference: ${input.recordId}`,
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
              <td style="padding:0 28px 12px;font-size:22px;font-weight:700;color:#ffffff;">${
                invoice ? "Invoice" : "Update"
              }</td>
            </tr>
            <tr>
              <td style="padding:0 28px 20px;font-size:15px;line-height:1.6;color:#d6d6d6;">
                Hi ${escapeHtml(input.name)},<br /><br />
                We've updated your ${escapeHtml(input.recordLabel)}
                <strong style="color:#ffffff;">${escapeHtml(input.recordId)}</strong>
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
