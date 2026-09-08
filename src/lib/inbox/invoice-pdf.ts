import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import { formatDate, formatOrderNumber } from "@/lib/inbox/format";
import type { InvoiceDetails } from "@/lib/inbox/invoice";
import { site } from "@/lib/site";

const teal = rgb(0.07, 0.784, 0.69);
const navy = rgb(0.05, 0.08, 0.12);
const muted = rgb(0.35, 0.38, 0.42);
const line = rgb(0.86, 0.88, 0.9);
const white = rgb(1, 1, 1);

export type InvoicePdfInput = {
  invoice: InvoiceDetails;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  reference: string;
};

function pdfSafe(value: string) {
  return value
    .replaceAll("\u00a0", " ")
    .replaceAll("\u202f", " ")
    .replaceAll("–", "-")
    .replaceAll("—", "-")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");
}

function money(amount: number) {
  return `R ${amount.toFixed(2)}`;
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const safe = pdfSafe(text);
  const lines: string[] = [];
  for (const paragraph of safe.split(/\r?\n/)) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }
    const words = paragraph.split(/\s+/);
    let current = "";
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) <= maxWidth) {
        current = next;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
  }
  return lines.length ? lines : [""];
}

async function loadLogo() {
  try {
    return await readFile(path.join(process.cwd(), "public", "techly-badge.png"));
  } catch {
    return null;
  }
}

export function invoicePdfFilename(number: string) {
  const safe = number.replace(/[^\w.-]+/g, "-").replace(/^-|-$/g, "");
  return `${safe || "Techly-invoice"}.pdf`;
}

export async function buildInvoicePdf(input: InvoicePdfInput) {
  const invoice = input.invoice;
  const amount = invoice.amount ?? 0;
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const margin = 48;

  page.drawRectangle({
    x: 0,
    y: height - 118,
    width,
    height: 118,
    color: navy,
  });
  page.drawRectangle({
    x: 0,
    y: height - 122,
    width,
    height: 4,
    color: teal,
  });

  const logoBytes = await loadLogo();
  if (logoBytes) {
    const logo = await pdf.embedPng(logoBytes);
    page.drawImage(logo, {
      x: margin,
      y: height - 108,
      width: 72,
      height: 72,
    });
  }

  const headerX = logoBytes ? margin + 88 : margin;
  page.drawText("TECHLY PC", {
    x: headerX,
    y: height - 58,
    size: 18,
    font: bold,
    color: white,
  });
  page.drawText(pdfSafe(site.tagline), {
    x: headerX,
    y: height - 76,
    size: 8,
    font,
    color: teal,
  });
  page.drawText(pdfSafe(`${site.email}  |  ${site.phoneDisplay}`), {
    x: headerX,
    y: height - 92,
    size: 8,
    font,
    color: rgb(0.75, 0.8, 0.82),
  });

  const invoiceLabel = "INVOICE";
  const invoiceWidth = bold.widthOfTextAtSize(invoiceLabel, 22);
  page.drawText(invoiceLabel, {
    x: width - margin - invoiceWidth,
    y: height - 62,
    size: 22,
    font: bold,
    color: teal,
  });

  let y = height - 156;
  page.drawText("Bill to", {
    x: margin,
    y,
    size: 9,
    font: bold,
    color: teal,
  });
  page.drawText("Invoice details", {
    x: 340,
    y,
    size: 9,
    font: bold,
    color: teal,
  });

  y -= 18;
  const billLines = [
    input.clientName,
    input.clientCompany,
    input.clientEmail,
  ].filter(Boolean);
  const metaLines = [
    `Invoice: ${invoice.number}`,
    `Date: ${formatDate(new Date().toISOString())}`,
    `Reference: ${formatOrderNumber(input.reference)}`,
  ];
  const rowCount = Math.max(billLines.length, metaLines.length);
  for (let i = 0; i < rowCount; i += 1) {
    if (billLines[i]) {
      page.drawText(pdfSafe(billLines[i]), {
        x: margin,
        y,
        size: 11,
        font: i === 0 ? bold : font,
        color: navy,
      });
    }
    if (metaLines[i]) {
      page.drawText(pdfSafe(metaLines[i]), {
        x: 340,
        y,
        size: 11,
        font,
        color: navy,
      });
    }
    y -= 16;
  }

  y -= 18;
  page.drawRectangle({
    x: margin,
    y: y - 6,
    width: width - margin * 2,
    height: 24,
    color: navy,
  });
  page.drawText("Description", {
    x: margin + 12,
    y: y + 2,
    size: 10,
    font: bold,
    color: white,
  });
  const amountHeader = "Amount";
  page.drawText(amountHeader, {
    x: width - margin - 12 - bold.widthOfTextAtSize(amountHeader, 10),
    y: y + 2,
    size: 10,
    font: bold,
    color: white,
  });

  y -= 36;
  const descLines = wrapText(invoice.description, font, 11, 360);
  const blockTop = y + 12;
  for (const descLine of descLines) {
    page.drawText(descLine, {
      x: margin + 12,
      y,
      size: 11,
      font,
      color: navy,
    });
    y -= 15;
  }
  const amountText = money(amount);
  page.drawText(amountText, {
    x: width - margin - 12 - font.widthOfTextAtSize(amountText, 11),
    y: blockTop - 12,
    size: 11,
    font,
    color: navy,
  });

  y -= 10;
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: line,
  });
  y -= 28;
  page.drawText("Amount due", {
    x: 340,
    y,
    size: 11,
    font,
    color: muted,
  });
  page.drawText(amountText, {
    x: width - margin - bold.widthOfTextAtSize(amountText, 16),
    y: y - 2,
    size: 16,
    font: bold,
    color: teal,
  });

  if (invoice.paymentDetails.trim()) {
    y -= 48;
    page.drawText("Payment details", {
      x: margin,
      y,
      size: 10,
      font: bold,
      color: teal,
    });
    y -= 8;
    const payLines = wrapText(invoice.paymentDetails, font, 10, width - margin * 2 - 24);
    const boxHeight = payLines.length * 14 + 20;
    page.drawRectangle({
      x: margin,
      y: y - boxHeight,
      width: width - margin * 2,
      height: boxHeight,
      color: rgb(0.96, 0.98, 0.98),
      borderColor: line,
      borderWidth: 1,
    });
    let payY = y - 16;
    for (const payLine of payLines) {
      page.drawText(payLine, {
        x: margin + 12,
        y: payY,
        size: 10,
        font,
        color: navy,
      });
      payY -= 14;
    }
    y = y - boxHeight;
  }

  page.drawLine({
    start: { x: margin, y: 56 },
    end: { x: width - margin, y: 56 },
    thickness: 1,
    color: line,
  });
  page.drawText(pdfSafe(`${site.name}  |  ${site.url.replace("https://", "")}  |  ${site.location}`), {
    x: margin,
    y: 38,
    size: 8,
    font,
    color: muted,
  });
  page.drawText("Thank you for your business.", {
    x: margin,
    y: 24,
    size: 8,
    font,
    color: muted,
  });

  return Buffer.from(await pdf.save());
}
