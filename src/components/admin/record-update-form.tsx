"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { RecordUpdateState } from "@/app/admin/actions";
import { formatDateTime, formatZar } from "@/lib/inbox/format";
import {
  invoicePaymentDetails,
  invoiceTerms,
  invoiceTotals,
  type InvoiceDetails,
  type InvoiceLine,
} from "@/lib/inbox/invoice";
import { site } from "@/lib/site";

const initial: RecordUpdateState = { ok: false, message: "" };

const fieldClass =
  "w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-accent/50";

function emptyLine(): InvoiceLine {
  return { description: "", quantity: 1, unitPrice: 0 };
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
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  const router = useRouter();
  const [popupOpen, setPopupOpen] = useState(false);
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

  useEffect(() => {
    if (state.ok && state.emailed) setPopupOpen(true);
  }, [state]);

  function closePopup() {
    setPopupOpen(false);
    if (state.redirectTo) router.push(state.redirectTo);
  }

  function updateLine(index: number, patch: Partial<InvoiceLine>) {
    setItems((current) =>
      current.map((line, lineIndex) =>
        lineIndex === index ? { ...line, ...patch } : line,
      ),
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-[1.4rem] border border-white/12 bg-[#111] p-5"
    >
      <input type="hidden" name="recordId" value={id} />
      <input type="hidden" name="clientName" value={clientName} />
      {state.message && !state.emailed ? (
        <p
          role="status"
          aria-live="polite"
          className={
            state.ok
              ? "rounded-xl border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-accent"
              : "rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100"
          }
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
              ? " Marking Closed removes it from the open list."
              : statuses.some((option) => option.value === "resolved")
                ? " Marking Resolved removes it from the open list."
                : ""}
          </span>
        ) : null}
      </label>

      <div className="space-y-4 border-t border-white/10 pt-4">
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
              className="grid gap-2 rounded-2xl border border-white/10 p-3 sm:grid-cols-[1fr_5.5rem_7rem_6rem_auto]"
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
                <p className="rounded-xl border border-white/10 px-3 py-2.5 text-sm text-accent">
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

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/80">
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

      {popupOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="email-sent-title"
          onClick={closePopup}
        >
          <div
            className="w-full max-w-lg rounded-[1.8rem] border border-accent/40 bg-[#111] px-6 py-10 text-center shadow-2xl sm:px-10"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Sent
            </p>
            <h2
              id="email-sent-title"
              className="mt-4 text-4xl font-semibold text-white sm:text-5xl"
            >
              Email sent
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/75">
              {state.message}
            </p>
            {state.invoiceNumber ? (
              <p className="mt-4 text-sm text-white/55">
                Find it later in Invoice file with{" "}
                <span className="font-medium text-white">{state.invoiceNumber}</span>.
              </p>
            ) : null}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              {state.invoiceNumber ? (
                <Link
                  href={`/admin/invoices?q=${encodeURIComponent(state.invoiceNumber)}`}
                  className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white hover:border-white/40"
                >
                  Open invoice file
                </Link>
              ) : null}
              <Button type="button" variant="solid" onClick={closePopup}>
                OK
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
