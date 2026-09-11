import { site } from "@/lib/site";

export type InvoiceLine = {
  description: string;
  details?: string;
  quantity: number;
  unitPrice: number;
};

export type InvoiceDetails = {
  number: string;
  description: string;
  amount: number | null;
  paymentDetails: string;
  sentAt: string | null;
  items: InvoiceLine[];
  calloutFee: number;
  depositPercent: number;
  depositPaidAt: string | null;
  paidAt: string | null;
};

type StoredInvoicePayload = {
  v: 1;
  items: InvoiceLine[];
  calloutFee: number;
  depositPercent: number;
  summary: string;
  depositPaidAt?: string | null;
  paidAt?: string | null;
};

export const invoiceTerms = [
  "A deposit is payable before work starts.",
  "The remaining balance is payable after the work is completed.",
  "The call-out fee is non-refundable.",
] as const;

export function invoiceTermsFor(
  invoice: Pick<InvoiceDetails, "calloutFee"> | null | undefined,
) {
  if ((invoice?.calloutFee || 0) > 0) return [...invoiceTerms];
  return invoiceTerms.filter(
    (term) => term !== "The call-out fee is non-refundable.",
  );
}

export function emptyInvoice(): InvoiceDetails {
  return {
    number: "",
    description: "",
    amount: null,
    paymentDetails: "",
    sentAt: null,
    items: [],
    calloutFee: 0,
    depositPercent: 50,
    depositPaidAt: null,
    paidAt: null,
  };
}

export function roundMoney(amount: number) {
  return Math.round(amount * 100) / 100;
}

export function lineTotal(line: InvoiceLine) {
  return roundMoney(line.quantity * line.unitPrice);
}

export function invoiceTotals(invoice: Pick<InvoiceDetails, "items" | "calloutFee" | "depositPercent">) {
  const itemsTotal = roundMoney(
    invoice.items.reduce((sum, line) => sum + lineTotal(line), 0),
  );
  const callout = roundMoney(invoice.calloutFee || 0);
  const total = roundMoney(itemsTotal + callout);
  const depositPercent = Math.min(100, Math.max(0, invoice.depositPercent || 50));
  const workDeposit = roundMoney(itemsTotal * (depositPercent / 100));
  const depositDue = roundMoney(workDeposit + callout);
  const balanceDue = roundMoney(total - depositDue);
  return { itemsTotal, callout, total, depositPercent, workDeposit, depositDue, balanceDue };
}

export function summarizeInvoiceItems(items: InvoiceLine[]) {
  return items
    .map((line) => `${line.quantity} x ${line.description} @ R ${line.unitPrice.toFixed(2)}`)
    .join("; ");
}

export function invoicePaymentDetails(clientName: string) {
  const reference = clientName.trim() || "Your name";
  return [
    "FNB Business",
    `Account number: ${site.banking.accountNumber}`,
    `Account name: ${site.banking.accountName}`,
    `Branch code: ${site.banking.branchCode}`,
    `Reference: ${reference}`,
  ].join("\n");
}

export function suggestedInvoiceNumber(recordId: string) {
  const match = recordId.trim().match(/^TECHLYPC[-\s]+(\d+)$/i);
  if (match) return `INV-TECHLYPC-${match[1].padStart(3, "0")}`;
  return `INV-TECHLYPC-${recordId}`;
}

export function parseZar(raw: string) {
  const cleaned = raw.replace(/[Rr]/g, "").replace(/\s/g, "").replace(/,/g, "").trim();
  if (!cleaned) return null;
  const amount = Number(cleaned);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return roundMoney(amount);
}

export function encodeInvoiceDescription(invoice: InvoiceDetails) {
  const payload: StoredInvoicePayload = {
    v: 1,
    items: invoice.items,
    calloutFee: invoice.calloutFee,
    depositPercent: invoice.depositPercent,
    summary: invoice.description,
    depositPaidAt: invoice.depositPaidAt,
    paidAt: invoice.paidAt,
  };
  return JSON.stringify(payload);
}

export function decodeInvoiceDescription(
  raw: string,
  amount: number | null,
): Pick<
  InvoiceDetails,
  | "items"
  | "calloutFee"
  | "depositPercent"
  | "description"
  | "depositPaidAt"
  | "paidAt"
> {
  try {
    const parsed = JSON.parse(raw) as StoredInvoicePayload;
    if (parsed && parsed.v === 1 && Array.isArray(parsed.items)) {
      const items = parsed.items
        .filter((line) => line && typeof line.description === "string")
        .map((line) => ({
          description: line.description,
          details:
            typeof line.details === "string" ? line.details.trim() : "",
          quantity: Number(line.quantity) || 0,
          unitPrice: Number(line.unitPrice) || 0,
        }));
      return {
        items,
        calloutFee: Number(parsed.calloutFee) || 0,
        depositPercent: Number(parsed.depositPercent) || 50,
        description: parsed.summary || summarizeInvoiceItems(items),
        depositPaidAt: parsed.depositPaidAt || null,
        paidAt: parsed.paidAt || null,
      };
    }
  } catch {
    /* legacy plain-text invoices */
  }

  if (raw.trim() && amount !== null) {
    return {
      items: [{ description: raw, quantity: 1, unitPrice: amount }],
      calloutFee: 0,
      depositPercent: 50,
      description: raw,
      depositPaidAt: null,
      paidAt: null,
    };
  }

  return {
    items: [],
    calloutFee: 0,
    depositPercent: 50,
    description: raw,
    depositPaidAt: null,
    paidAt: null,
  };
}

export function invoiceIsSendable(
  invoice: InvoiceDetails | null | undefined,
): invoice is InvoiceDetails {
  if (!invoice) return false;
  return invoice.items.length > 0 || invoice.calloutFee > 0;
}

export function invoiceFromForm(
  formData: FormData,
  fallbackNumber: string,
):
  | { ok: true; invoice: InvoiceDetails; include: boolean }
  | { ok: false; message: string } {
  const typedNumber = String(formData.get("invoiceNumber") ?? "").trim();
  const paymentDetails = String(formData.get("invoicePaymentDetails") ?? "").trim();
  const clientName = String(formData.get("clientName") ?? "").trim();
  const descriptions = formData.getAll("itemDescription").map((value) => String(value).trim());
  const detailsList = formData.getAll("itemDetails").map((value) => String(value).trim());
  const quantities = formData.getAll("itemQty").map((value) => String(value).trim());
  const unitPrices = formData.getAll("itemUnit").map((value) => String(value).trim());
  const calloutFee = parseZar(String(formData.get("invoiceCalloutFee") ?? "").trim()) ?? 0;
  const depositRaw = Number(String(formData.get("invoiceDepositPercent") ?? "50").trim());
  const depositPercent = Number.isFinite(depositRaw) ? Math.min(100, Math.max(0, depositRaw)) : 50;

  const items: InvoiceLine[] = [];
  for (let index = 0; index < Math.max(descriptions.length, quantities.length, unitPrices.length); index += 1) {
    const description = descriptions[index] ?? "";
    const details = detailsList[index] ?? "";
    const quantityRaw = quantities[index] ?? "";
    const unitRaw = unitPrices[index] ?? "";
    if (!description && !details && !quantityRaw && !unitRaw) continue;
    if (!description && (!unitRaw || parseZar(unitRaw) === 0) && (!quantityRaw || Number(quantityRaw) === 1)) {
      continue;
    }
    const quantity = Number(quantityRaw);
    const unitPrice = parseZar(unitRaw);
    if (!description || !Number.isFinite(quantity) || quantity <= 0 || unitPrice === null) {
      return {
        ok: false,
        message: "Each item needs a description, quantity and unit price, or clear that row.",
      };
    }
    items.push({ description, details, quantity, unitPrice });
  }

  if (items.length === 0 && calloutFee <= 0) {
    return {
      ok: true,
      invoice: { ...emptyInvoice(), number: typedNumber },
      include: false,
    };
  }

  const totals = invoiceTotals({ items, calloutFee, depositPercent });
  const description =
    summarizeInvoiceItems(items) ||
    (calloutFee > 0 ? "Call-out fee" : "");

  return {
    ok: true,
    include: true,
    invoice: {
      number: typedNumber || fallbackNumber,
      description,
      amount: totals.total,
      paymentDetails: paymentDetails || invoicePaymentDetails(clientName),
      sentAt: null,
      items,
      calloutFee,
      depositPercent,
      depositPaidAt: null,
      paidAt: null,
    },
  };
}
