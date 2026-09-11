"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { RecordUpdateState } from "@/app/admin/actions";
import { markInvoicePayment } from "@/app/admin/actions";
import { formatDateTime, formatZar } from "@/lib/inbox/format";
import {
  invoiceIsSendable,
  invoicePaymentDetails,
  invoiceTerms,
  invoiceTotals,
  type InvoiceDetails,
  type InvoiceLine,
} from "@/lib/inbox/invoice";
import { site } from "@/lib/site";

const initial: RecordUpdateState = { ok: false, message: "" };

const fieldClass =
  "w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-accent/50";

function emptyLine(): InvoiceLine {
  return { description: "", quantity: 1, unitPrice: 0 };
}

function EmailSentPopup({
  open,
  message,
  invoiceNumber,
  onClose,
}: {
  open: boolean;
  message: string;
  invoiceNumber?: string;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-sent-title"
      onClick={onClose}
    >
      <div
        className="flex h-[min(680px,92dvh)] w-full max-w-[390px] flex-col rounded-[2.4rem] border border-accent/50 bg-[#111] px-6 py-8 text-center shadow-[0_0_80px_rgba(18,200,176,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
          Sent
        </p>
        <div className="flex flex-1 flex-col items-center justify-center">
          <h2
            id="email-sent-title"
            className="text-5xl font-semibold leading-tight text-white"
          >
            Email sent
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-white/75">{message}</p>
          {invoiceNumber ? (
            <p className="mt-5 text-sm text-white/55">
              Find it later in Invoice file with{" "}
              <span className="font-medium text-white">{invoiceNumber}</span>.
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-3">
          {invoiceNumber ? (
            <Link
              href={`/admin/invoices?q=${encodeURIComponent(invoiceNumber)}`}
              className="inline-flex items-center justify-center rounded-full border border-white/12 px-5 py-3 text-sm font-semibold text-white hover:border-white/30"
            >
              Open invoice file
            </Link>
          ) : null}
          <Button type="button" variant="solid" className="w-full py-3" onClick={onClose}>
            OK
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function RecordUpdateForm({
  action,
  id,
  status,
  statuses,
  note,
  invoice,
  suggestedInvoiceNumber,
  notifyEmail,
  emailConfigured = true,
  clientName = "",
  source,
}: {
  action: (
    prev: RecordUpdateState,
    formData: FormData,
  ) => Promise<RecordUpdateState>;
  id: string;
  status: string;
  statuses: { value: string; label: string }[];
  note: string;
  invoice: InvoiceDetails;
  suggestedInvoiceNumber: string;
  notifyEmail?: string;
  emailConfigured?: boolean;
  clientName?: string;
  source: "contact" | "ticket";
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  const [paymentState, paymentAction, paymentPending] = useActionState(
    markInvoicePayment,
    initial,
  );
  const router = useRouter();
  const [popupOpen, setPopupOpen] = useState(false);
  const [paymentPopupOpen, setPaymentPopupOpen] = useState(false);
  const [items, setItems] = useState<InvoiceLine[]>(
    invoice.items.length > 0 ? invoice.items : [emptyLine()],
  );
  const [calloutFee, setCalloutFee] = useState(
    invoice.calloutFee ? String(invoice.calloutFee) : "",
  );
  const [depositPercent, setDepositPercent] = useState(
    String(invoice.depositPercent || 50),
  );

  const totals = useMemo(
    () =>
      invoiceTotals({
        items: items.filter((line) => line.description.trim()),
        calloutFee: Number(calloutFee) || 0,
        depositPercent: Number(depositPercent) || 50,
      }),
    [items, calloutFee, depositPercent],
  );
  const canMarkPayment = invoiceIsSendable(invoice);

  useEffect(() => {
    if (state.ok && state.message) setPopupOpen(true);
  }, [state]);

  useEffect(() => {
    if (paymentState.ok && paymentState.message) setPaymentPopupOpen(true);
  }, [paymentState]);

  function closePopup() {
    setPopupOpen(false);
    if (state.redirectTo) router.push(state.redirectTo);
  }

  function closePaymentPopup() {
    setPaymentPopupOpen(false);
    if (paymentState.ok) router.refresh();
  }

  function updateLine(index: number, patch: Partial<InvoiceLine>) {
    setItems((current) =>
      current.map((line, lineIndex) =>
        lineIndex === index ? { ...line, ...patch } : line,
      ),
    );
  }

  return (
    <div className="space-y-4">
    <form
      action={formAction}
      className="space-y-4 rounded-[1.4rem] border border-white/12 bg-[#111] p-5"
    >
      <input type="hidden" name="recordId" value={id} />
      <input type="hidden" name="clientName" value={clientName} />
      {state.message && !state.ok ? (
        <p
          role="status"
          aria-live="polite"
          className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100"
        >
          {state.message}
        </p>
      ) : notifyEmail && !emailConfigured ? (
        <p
          role="status"
          className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100"
        >
          Email sending is not set up yet. Add a Resend API key or SMTP mailbox
          details in .env.local, then restart the server.
        </p>
      ) : null}
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white">Status</span>
        <select name="status" defaultValue={status} className={fieldClass}>
          {statuses.map((option) => (
            <option key={option.value} value={option.value} className="bg-black">
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white">
          Note to client
        </span>
        <textarea
          name="adminNote"
          defaultValue={note}
          rows={4}
          placeholder="This note is emailed to the client with the new status…"
          className={`${fieldClass} resize-y`}
        />
        {notifyEmail ? (
          <span className="mt-2 block text-xs text-white/45">
            Saving emails the status and this note to {notifyEmail}.
            {statuses.some((option) => option.value === "closed")
              ? " Marking Closed moves them to Follow-up leads for reminders. Deposit paid and Full payment email the client an acknowledgment and keep them under Paid clients."
              : statuses.some((option) => option.value === "resolved")
                ? " Marking Resolved removes it from the open list."
                : ""}
          </span>
        ) : null}
      </label>

      <div className="space-y-4 border-t border-white/12 pt-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            Invoice
          </p>
          <p className="mt-1 text-xs text-white/45">
            Add items with quantity and unit price. The total, deposit and
            balance are calculated for the PDF invoice.
          </p>
        </div>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white">
            Invoice number
          </span>
          <input
            name="invoiceNumber"
            key={invoice.number || suggestedInvoiceNumber}
            defaultValue={invoice.number || suggestedInvoiceNumber}
            className={fieldClass}
          />
        </label>

        <div className="space-y-3">
          {items.map((line, index) => (
            <div
              key={index}
              className="grid gap-2 rounded-[1.4rem] border border-white/12 p-3 sm:grid-cols-[1fr_5.5rem_7rem_6rem_auto]"
            >
              <label className="block sm:col-span-1">
                <span className="mb-1 block text-xs text-white/55">Item</span>
                <input
                  name="itemDescription"
                  value={line.description}
                  onChange={(event) =>
                    updateLine(index, { description: event.target.value })
                  }
                  placeholder="Work or product"
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-white/55">Qty</span>
                <input
                  name="itemQty"
                  value={line.quantity}
                  onChange={(event) =>
                    updateLine(index, {
                      quantity: Number(event.target.value) || 0,
                    })
                  }
                  inputMode="numeric"
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-white/55">
                  Unit price
                </span>
                <input
                  name="itemUnit"
                  value={line.unitPrice || ""}
                  onChange={(event) =>
                    updateLine(index, {
                      unitPrice: Number(event.target.value) || 0,
                    })
                  }
                  inputMode="decimal"
                  placeholder="0.00"
                  className={fieldClass}
                />
              </label>
              <div>
                <span className="mb-1 block text-xs text-white/55">Line total</span>
                <p className="rounded-xl border border-white/12 px-3 py-2.5 text-sm text-accent">
                  {formatZar(line.quantity * line.unitPrice)}
                </p>
              </div>
              {items.length > 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setItems((current) =>
                      current.filter((_, lineIndex) => lineIndex !== index),
                    )
                  }
                  className="self-end text-xs text-white/45 hover:text-white"
                >
                  Remove
                </button>
              ) : (
                <span className="hidden sm:block" />
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setItems((current) => [...current, emptyLine()])}
            className="text-sm font-medium text-accent hover:text-white"
          >
            Add another item
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-white">
              Call-out fee (R)
            </span>
            <input
              name="invoiceCalloutFee"
              value={calloutFee}
              onChange={(event) => setCalloutFee(event.target.value)}
              inputMode="decimal"
              placeholder="0.00"
              className={fieldClass}
            />
            <span className="mt-1.5 block text-xs text-white/45">
              Non-refundable. Added to the total.
            </span>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-white">
              Deposit before work (%)
            </span>
            <input
              name="invoiceDepositPercent"
              value={depositPercent}
              onChange={(event) => setDepositPercent(event.target.value)}
              inputMode="numeric"
              className={fieldClass}
            />
            <span className="mt-1.5 block text-xs text-white/45">
              Balance is due after the work is completed.
            </span>
          </label>
        </div>

        <ul className="list-disc space-y-1 pl-5 text-xs text-white/45">
          {invoiceTerms.map((term) => (
            <li key={term}>{term}</li>
          ))}
        </ul>

        <div className="rounded-[1.4rem] border border-white/12 bg-white/5 p-4 text-sm text-white/75">
          <p className="flex justify-between gap-4">
            <span>Items</span>
            <span>{formatZar(totals.itemsTotal)}</span>
          </p>
          <p className="mt-1 flex justify-between gap-4">
            <span>Call-out fee</span>
            <span>{formatZar(totals.callout)}</span>
          </p>
          <p className="mt-2 flex justify-between gap-4 font-semibold text-white">
            <span>Total</span>
            <span className="text-accent">{formatZar(totals.total)}</span>
          </p>
          <p className="mt-3 flex justify-between gap-4 text-xs text-white/55">
            <span>Deposit due before work ({totals.depositPercent}%)</span>
            <span>{formatZar(totals.depositDue)}</span>
          </p>
          <p className="mt-1 flex justify-between gap-4 text-xs text-white/55">
            <span>Balance due after work</span>
            <span>{formatZar(totals.balanceDue)}</span>
          </p>
          {invoice.depositPaidAt ? (
            <p className="mt-3 text-xs text-accent">
              Deposit marked paid {formatDateTime(invoice.depositPaidAt)}.
            </p>
          ) : null}
          {invoice.paidAt ? (
            <p className="mt-1 text-xs text-accent">
              Paid in full {formatDateTime(invoice.paidAt)}.
            </p>
          ) : null}
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white">
            Extra payment notes
          </span>
          <textarea
            name="invoicePaymentDetails"
            defaultValue={
              invoice.paymentDetails === invoicePaymentDetails(clientName)
                ? ""
                : invoice.paymentDetails
            }
            rows={3}
            placeholder="Optional notes only. FNB details are added to the PDF automatically."
            className={`${fieldClass} resize-y`}
          />
          <span className="mt-2 block text-xs text-white/45">
            Every invoice includes FNB Business account {site.banking.accountNumber},{" "}
            {site.banking.accountName}, branch {site.banking.branchCode}. Reference
            is the client’s name.
          </span>
        </label>
        {invoice.sentAt ? (
          <p className="text-xs text-white/45">
            Last emailed {formatDateTime(invoice.sentAt)}.
          </p>
        ) : null}
      </div>

      <Button type="submit" variant="solid" disabled={pending}>
        {pending ? "Emailing client…" : "Save and email client"}
      </Button>

      <EmailSentPopup
        open={popupOpen}
        message={state.message}
        invoiceNumber={state.invoiceNumber}
        onClose={closePopup}
      />
    </form>

    {canMarkPayment ? (
      <div className="space-y-4 rounded-[1.4rem] border border-white/12 bg-[#111] p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            Payment received
          </p>
          <p className="mt-1 text-xs text-white/45">
            Mark the deposit or full payment when the client pays. A thank-you
            email is sent automatically.
          </p>
        </div>
        {paymentState.message && !paymentState.ok ? (
          <p
            role="status"
            className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100"
          >
            {paymentState.message}
          </p>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row">
          <form action={paymentAction} className="flex-1">
            <input type="hidden" name="recordId" value={id} />
            <input type="hidden" name="source" value={source} />
            <input type="hidden" name="paymentKind" value="deposit" />
            <Button
              type="submit"
              variant="solid"
              className="w-full"
              disabled={
                paymentPending || Boolean(invoice.depositPaidAt) || Boolean(invoice.paidAt)
              }
            >
              {invoice.depositPaidAt || invoice.paidAt
                ? "Deposit already marked"
                : paymentPending
                  ? "Sending…"
                  : "Mark deposit paid"}
            </Button>
          </form>
          <form action={paymentAction} className="flex-1">
            <input type="hidden" name="recordId" value={id} />
            <input type="hidden" name="source" value={source} />
            <input type="hidden" name="paymentKind" value="full" />
            <Button
              type="submit"
              variant="solid"
              className="w-full"
              disabled={paymentPending || Boolean(invoice.paidAt)}
            >
              {invoice.paidAt
                ? "Already paid in full"
                : paymentPending
                  ? "Sending…"
                  : "Mark paid in full"}
            </Button>
          </form>
        </div>
        <EmailSentPopup
          open={paymentPopupOpen && Boolean(paymentState.message)}
          message={paymentState.message}
          invoiceNumber={paymentState.invoiceNumber}
          onClose={closePaymentPopup}
        />
      </div>
    ) : null}
    </div>
  );
}
