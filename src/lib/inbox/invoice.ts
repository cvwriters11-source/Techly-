export type InvoiceDetails = {
  number: string;
  description: string;
  amount: number | null;
  paymentDetails: string;
  sentAt: string | null;
};

export function emptyInvoice(): InvoiceDetails {
  return {
    number: "",
    description: "",
    amount: null,
    paymentDetails: "",
    sentAt: null,
  };
}

export function suggestedInvoiceNumber(recordId: string) {
  return `INV-TECHLYPC-${recordId}`;
}

export function parseZar(raw: string) {
  const cleaned = raw.replace(/[Rr]/g, "").replace(/\s/g, "").replace(/,/g, "").trim();
  if (!cleaned) return null;
  const amount = Number(cleaned);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return Math.round(amount * 100) / 100;
}

export function invoiceFromForm(
  formData: FormData,
  fallbackNumber: string,
):
  | { ok: true; invoice: InvoiceDetails; include: boolean }
  | { ok: false; message: string } {
  const typedNumber = String(formData.get("invoiceNumber") ?? "").trim();
  const description = String(formData.get("invoiceDescription") ?? "").trim();
  const amountRaw = String(formData.get("invoiceAmount") ?? "").trim();
  const paymentDetails = String(formData.get("invoicePaymentDetails") ?? "").trim();
  const amount = parseZar(amountRaw);
  const filled = Boolean(description || amountRaw || paymentDetails);

  if (!filled) {
    return {
      ok: true,
      invoice: { ...emptyInvoice(), number: typedNumber },
      include: false,
    };
  }

  if (!description || amount === null) {
    return {
      ok: false,
      message:
        "Add both an invoice description and a valid amount in R, or clear the invoice fields.",
    };
  }

  return {
    ok: true,
    include: true,
    invoice: {
      number: typedNumber || fallbackNumber,
      description,
      amount,
      paymentDetails,
      sentAt: null,
    },
  };
}
