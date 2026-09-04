"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { RecordUpdateState } from "@/app/admin/actions";
import { formatDateTime } from "@/lib/inbox/format";
import type { InvoiceDetails } from "@/lib/inbox/invoice";

const initial: RecordUpdateState = { ok: false, message: "" };

const fieldClass =
  "w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-accent/50";

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
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  const amountValue =
    invoice.amount === null || invoice.amount === undefined
      ? ""
      : String(invoice.amount);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-[1.4rem] border border-white/12 bg-[#111] p-5"
    >
      <input type="hidden" name="recordId" value={id} />
      {state.message ? (
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
            Saving emails the status and this note to {notifyEmail}. Marking a
          ticket as Resolved removes it from the open list.
          </span>
        ) : null}
      </label>

      <div className="space-y-4 border-t border-white/10 pt-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            Invoice
          </p>
          <p className="mt-1 text-xs text-white/45">
            Fill this in to email an invoice with the update. Leave it blank to
            send only the status and note.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
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
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-white">
              Amount (R)
            </span>
            <input
              name="invoiceAmount"
              defaultValue={amountValue}
              inputMode="decimal"
              placeholder="0.00"
              className={fieldClass}
            />
          </label>
        </div>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white">
            Invoice description
          </span>
          <textarea
            name="invoiceDescription"
            defaultValue={invoice.description}
            rows={3}
            placeholder="What this invoice is for…"
            className={`${fieldClass} resize-y`}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white">
            Payment details
          </span>
          <textarea
            name="invoicePaymentDetails"
            defaultValue={invoice.paymentDetails}
            rows={3}
            placeholder="Bank, account name, account number, reference…"
            className={`${fieldClass} resize-y`}
          />
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
    </form>
  );
}
