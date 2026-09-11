import nodemailer from "nodemailer";
import { site } from "@/lib/site";
import { formatDate, formatOrderNumber, formatZar } from "@/lib/inbox/format";
import {
  invoiceIsSendable,
  invoiceTerms,
  invoiceTotals,
  lineTotal,
  type InvoiceDetails,
} from "@/lib/inbox/invoice";
import {
  buildInvoicePdf,
  invoicePdfFilename,
} from "@/lib/inbox/invoice-pdf";

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

type MailAttachment = {
  filename: string;
  content: Buffer;
  contentType: string;
};

type MailPayload = {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
  attachments?: MailAttachment[];
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
      attachments: input.attachments?.map((file) => ({
        filename: file.filename,
        content: file.content.toString("base64"),
        content_type: file.contentType,
      })),
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
    attachments: input.attachments?.map((file) => ({
      filename: file.filename,
      content: file.content,
      contentType: file.contentType,
    })),
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
  const totals = invoiceTotals(invoice);
  const payment = invoice.paymentDetails.trim();
  const itemRows = invoice.items
    .map((item) => {
      const details = item.details?.trim()
        ? `<div style="margin-top:4px;font-size:12px;line-height:1.45;color:#9a9a9a;">${escapeHtml(item.details.trim()).replaceAll("\n", "<br />")}</div>`
        : "";
      return `<tr>
                    <td style="padding:0 16px 8px;font-size:14px;color:#ffffff;">${escapeHtml(item.description)}${details}</td>
                    <td style="padding:0 8px 8px;font-size:14px;color:#d6d6d6;text-align:center;white-space:nowrap;vertical-align:top;">${item.quantity}</td>
                    <td style="padding:0 8px 8px;font-size:14px;color:#d6d6d6;text-align:right;white-space:nowrap;vertical-align:top;">${escapeHtml(formatZar(item.unitPrice))}</td>
                    <td style="padding:0 16px 8px;font-size:14px;color:#ffffff;text-align:right;white-space:nowrap;vertical-align:top;">${escapeHtml(formatZar(lineTotal(item)))}</td>
                  </tr>`;
    })
    .join("");
  const calloutRow =
    totals.callout > 0
      ? `<tr>
                    <td colspan="3" style="padding:4px 16px 8px;font-size:14px;color:#d6d6d6;">Call-out fee (non-refundable)</td>
                    <td style="padding:4px 16px 8px;font-size:14px;color:#ffffff;text-align:right;">${escapeHtml(formatZar(totals.callout))}</td>
                  </tr>`
      : "";
  const termsHtml = invoiceTerms
    .map((term) => `<li style="margin:0 0 6px;color:#d6d6d6;">${escapeHtml(term)}</li>`)
    .join("");

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
                    <td colspan="2" style="padding:0 16px 8px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding:0 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#9a9a9a;">Item</td>
                          <td style="padding:0 8px 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#9a9a9a;text-align:center;">Qty</td>
                          <td style="padding:0 8px 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#9a9a9a;text-align:right;">Unit price</td>
                          <td style="padding:0 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#9a9a9a;text-align:right;">Amount</td>
                        </tr>
                        ${itemRows}
                        ${calloutRow}
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 16px 4px;font-size:14px;color:#9a9a9a;">Total</td>
                    <td style="padding:8px 16px 4px;font-size:18px;font-weight:700;color:#12c8b0;text-align:right;">${escapeHtml(formatZar(totals.total))}</td>
                  </tr>
                  <tr>
                    <td style="padding:0 16px 4px;font-size:13px;color:#9a9a9a;">Deposit due before work (${totals.depositPercent}%)</td>
                    <td style="padding:0 16px 4px;font-size:14px;color:#ffffff;text-align:right;">${escapeHtml(formatZar(totals.depositDue))}</td>
                  </tr>
                  <tr>
                    <td style="padding:0 16px 16px;font-size:13px;color:#9a9a9a;">Balance due after work</td>
                    <td style="padding:0 16px 16px;font-size:14px;color:#ffffff;text-align:right;">${escapeHtml(formatZar(totals.balanceDue))}</td>
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
                  <tr>
                    <td colspan="2" style="padding:0 16px 6px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#9a9a9a;">Terms</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding:0 16px 16px;font-size:13px;line-height:1.5;">
                      <ul style="margin:0;padding-left:18px;">${termsHtml}</ul>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>`;
}

export async function sendClientUpdateEmail(input: ClientUpdateEmail) {
  const note = input.note.trim();
  const resolved = input.statusLabel === "Resolved";
  const invoice = invoiceIsSendable(input.invoice) ? input.invoice : null;
  const totals = invoice ? invoiceTotals(invoice) : null;
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
    ...(invoice && totals
      ? [
          "",
          `A PDF invoice is attached: ${invoice.number}`,
          `Total: ${formatZar(totals.total)}`,
          `Deposit due before work: ${formatZar(totals.depositDue)}`,
          `Balance due after work: ${formatZar(totals.balanceDue)}`,
          ...invoiceTerms.map((term) => `- ${term}`),
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
                ${invoice ? "The branded PDF invoice is attached to this email.<br />" : ""}
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

  let attachments: MailAttachment[] | undefined;
  if (invoice) {
    try {
      attachments = [
        {
          filename: invoicePdfFilename(invoice.number),
          content: await buildInvoicePdf({
            invoice,
            clientName: input.name,
            clientCompany: input.company,
            clientEmail: input.to,
            reference: input.recordId,
          }),
          contentType: "application/pdf",
        },
      ];
    } catch (error) {
      return {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "The PDF invoice could not be created.",
      };
    }
  }

  return sendEmail({
    to: input.to,
    subject,
    text,
    html,
    attachments,
  });
}

export type PaymentThankYouEmail = {
  to: string;
  name: string;
  company: string;
  recordId: string;
  invoice: InvoiceDetails;
  kind: "deposit" | "full";
};

export async function sendPaymentThankYouEmail(input: PaymentThankYouEmail) {
  const totals = invoiceTotals(input.invoice);
  const isDeposit = input.kind === "deposit";
  const amount = isDeposit ? totals.depositDue : totals.total;
  const heading = isDeposit ? "Deposit received" : "Payment received in full";
  const subject = isDeposit
    ? `Thank you — Techly deposit received (${input.invoice.number})`
    : `Thank you — Techly invoice ${input.invoice.number} paid in full`;
  const intro = isDeposit
    ? `Thank you. We have received your deposit of ${formatZar(amount)} for invoice ${input.invoice.number}.`
    : `Thank you. We have received your full payment of ${formatZar(amount)} for invoice ${input.invoice.number}.`;
  const followUp = isDeposit
    ? `The remaining balance of ${formatZar(totals.balanceDue)} is payable after the work is completed.`
    : "Your invoice is now marked as paid in full. We appreciate your business.";

  const text = [
    `Hi ${input.name},`,
    "",
    intro,
    "",
    `Reference: ${formatOrderNumber(input.recordId)}`,
    `Invoice: ${input.invoice.number}`,
    `Amount acknowledged: ${formatZar(amount)}`,
    ...(isDeposit
      ? [`Balance still due after work: ${formatZar(totals.balanceDue)}`]
      : ["Status: Paid in full"]),
    "",
    followUp,
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
                ${escapeHtml(intro)}
                ${input.company ? `<br /><br />For ${escapeHtml(input.company)}.` : ""}
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;border:1px solid #2a2a2a;border-radius:12px;">
                  <tr>
                    <td style="padding:14px 16px 4px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#9a9a9a;">Reference</td>
                    <td style="padding:14px 16px 4px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#9a9a9a;text-align:right;">Invoice</td>
                  </tr>
                  <tr>
                    <td style="padding:0 16px 14px;font-size:15px;font-weight:700;color:#ffffff;">${escapeHtml(formatOrderNumber(input.recordId))}</td>
                    <td style="padding:0 16px 14px;font-size:15px;color:#d6d6d6;text-align:right;">${escapeHtml(input.invoice.number)}</td>
                  </tr>
                  <tr>
                    <td style="padding:0 16px 4px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#9a9a9a;">Amount acknowledged</td>
                    <td style="padding:0 16px 4px;font-size:18px;font-weight:700;color:#12c8b0;text-align:right;">${escapeHtml(formatZar(amount))}</td>
                  </tr>
                  ${
                    isDeposit
                      ? `<tr>
                    <td style="padding:0 16px 16px;font-size:13px;color:#9a9a9a;">Balance due after work</td>
                    <td style="padding:0 16px 16px;font-size:14px;color:#ffffff;text-align:right;">${escapeHtml(formatZar(totals.balanceDue))}</td>
                  </tr>`
                      : `<tr>
                    <td colspan="2" style="padding:0 16px 16px;font-size:14px;font-weight:700;color:#12c8b0;">Paid in full</td>
                  </tr>`
                  }
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 28px;font-size:14px;line-height:1.6;color:#9a9a9a;">
                ${escapeHtml(followUp)}<br /><br />
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

export type ContactCampaignEmail = {
  to: string;
  name: string;
  company: string;
  recordId: string;
  service: string;
  description: string;
  kind: "lead_reminder" | "paid_marketing";
};

export async function sendContactCampaignEmail(input: ContactCampaignEmail) {
  const siteUrl = adminBaseUrl();
  const servicesHref = `${siteUrl}/services`;
  const contactHref = `${siteUrl}/contact`;
  const isReminder = input.kind === "lead_reminder";
  const heading = isReminder
    ? "Still thinking about your Techly project?"
    : "Thank you for choosing Techly";
  const subject = isReminder
    ? `A quick note about your ${input.service} enquiry`
    : `Useful Techly updates for ${input.company || input.name}`;
  const intro = isReminder
    ? `You reached out about ${input.service}. We are still ready to help you move from enquiry to a clear quotation and a practical install or build.`
    : `Because you are already a Techly client, here is a short update on how we can keep supporting your business with software, IT support, automation and CCTV.`;
  const pitch = isReminder
    ? [
        "What we can do for you next:",
        `• Scope the ${input.service.toLowerCase()} work around your site or business`,
        "• Share a practical quotation with deposit and balance clearly set out",
        "• Install or build with remote support and clear next steps",
        "",
        "Reply to this email, or request a consultation online, and we will pick up where you left off.",
      ].join("\n")
    : [
        "Ways we can keep helping:",
        "• Expand CCTV coverage, remote viewing or solar cameras",
        "• Custom software and websites that match how you work",
        "• IT support, hosting and automation to reduce downtime",
        "",
        "When you are ready for the next improvement, reply to this email and we will put a quotation together.",
      ].join("\n");

  const text = [
    `Hi ${input.name},`,
    "",
    intro,
    "",
    `Reference: ${formatOrderNumber(input.recordId)}`,
    `Service: ${input.service}`,
    ...(input.description.trim()
      ? ["", "Your original brief:", input.description.trim()]
      : []),
    "",
    pitch,
    "",
    `Browse services: ${servicesHref}`,
    `Request a consultation: ${contactHref}`,
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
                ${escapeHtml(intro)}
                ${input.company ? `<br /><br />For ${escapeHtml(input.company)}.` : ""}
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;border:1px solid #2a2a2a;border-radius:12px;">
                  <tr>
                    <td style="padding:14px 16px 4px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#9a9a9a;">Reference</td>
                    <td style="padding:14px 16px 4px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#9a9a9a;text-align:right;">Service</td>
                  </tr>
                  <tr>
                    <td style="padding:0 16px 14px;font-size:15px;font-weight:700;color:#ffffff;">${escapeHtml(formatOrderNumber(input.recordId))}</td>
                    <td style="padding:0 16px 14px;font-size:15px;color:#d6d6d6;text-align:right;">${escapeHtml(input.service)}</td>
                  </tr>
                  ${
                    input.description.trim()
                      ? `<tr>
                    <td colspan="2" style="padding:0 16px 6px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#9a9a9a;">Your brief</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding:0 16px 16px;font-size:14px;line-height:1.6;color:#d6d6d6;">${noteToHtml(input.description.trim())}</td>
                  </tr>`
                      : ""
                  }
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 20px;font-size:15px;line-height:1.7;color:#d6d6d6;">
                ${noteToHtml(pitch)}
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 28px;">
                <a href="${escapeHtml(contactHref)}" style="display:inline-block;background:#12c8b0;color:#050505;text-decoration:none;font-weight:700;font-size:14px;padding:12px 18px;border-radius:999px;margin-right:10px;">Request a consultation</a>
                <a href="${escapeHtml(servicesHref)}" style="display:inline-block;color:#12c8b0;text-decoration:none;font-weight:700;font-size:14px;padding:12px 0;">View services</a>
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

export type MarketingBlastEmail = {
  to: string;
  name: string;
  subject: string;
  heading: string;
  body: string;
};

export async function sendMarketingBlastEmail(input: MarketingBlastEmail) {
  const siteUrl = adminBaseUrl();
  const servicesHref = `${siteUrl}/services`;
  const contactHref = `${siteUrl}/contact`;
  const greetingName = input.name.trim() || "there";

  const text = [
    `Hi ${greetingName},`,
    "",
    input.body,
    "",
    `Browse services: ${servicesHref}`,
    `Request a consultation: ${contactHref}`,
    "",
    "Techly",
    site.email,
    "",
    "You are receiving this because you contacted Techly or used our support.",
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
              <td style="padding:0 28px 12px;font-size:22px;font-weight:700;color:#ffffff;">${escapeHtml(input.heading)}</td>
            </tr>
            <tr>
              <td style="padding:0 28px 20px;font-size:15px;line-height:1.6;color:#d6d6d6;">
                Hi ${escapeHtml(greetingName)},<br /><br />
                ${noteToHtml(input.body)}
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 28px;">
                <a href="${escapeHtml(contactHref)}" style="display:inline-block;background:#12c8b0;color:#050505;text-decoration:none;font-weight:700;font-size:14px;padding:12px 18px;border-radius:999px;margin-right:10px;">Request a consultation</a>
                <a href="${escapeHtml(servicesHref)}" style="display:inline-block;color:#12c8b0;text-decoration:none;font-weight:700;font-size:14px;padding:12px 0;">View services</a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 28px;font-size:12px;line-height:1.5;color:#7a7a7a;">
                You are receiving this because you contacted Techly or used our support.<br />
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
    subject: input.subject,
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
