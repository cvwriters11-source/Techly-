import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/admin/detail-list";
import { formatDateTime, formatZar } from "@/lib/inbox/format";
import { invoiceTotals } from "@/lib/inbox/invoice";
import { listInvoiceFile } from "@/lib/inbox/store";

export const metadata: Metadata = {
  title: "Invoice file",
  robots: { index: false, follow: false },
};

export default async function AdminInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const invoices = await listInvoiceFile(q);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          Invoice file
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Invoices</h1>
        <p className="mt-2 text-sm text-white/55">
          Every emailed invoice stays here, including work that has left the
          open ticket and contact lists. Search by invoice number to open it.
        </p>
      </div>

      <form className="flex flex-col gap-3 sm:flex-row" action="/admin/invoices">
        <label className="block flex-1">
          <span className="sr-only">Invoice number</span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Search invoice number, e.g. INV-TECHLYPC-006"
            className="w-full rounded-xl border border-white/12 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-accent/50"
          />
        </label>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-black hover:bg-accent/90"
        >
          Find invoice
        </button>
      </form>

      {invoices.length === 0 ? (
        <p className="rounded-[1.4rem] border border-white/12 bg-[#0c0c0c] p-8 text-sm text-white/55">
          {q.trim()
            ? `No invoice matches “${q.trim()}”. Check the invoice number and try again.`
            : "No invoices in the file yet. When you save and email a client with an invoice, it is stored here."}
        </p>
      ) : (
        <div className="overflow-hidden rounded-[1.4rem] border border-white/12 bg-[#0c0c0c]">
          {invoices.map((row) => {
            const totals = invoiceTotals(row.invoice);
            return (
              <Link
                key={`${row.source}-${row.recordId}-${row.invoice.number}`}
                href={`/admin/invoices/${encodeURIComponent(row.invoice.number)}`}
                className="block border-b border-white/8 px-4 py-4 last:border-b-0 transition hover:bg-white/[0.03]"
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium break-words text-white">
                      {row.invoice.number}
                    </p>
                    <p className="mt-0.5 text-xs break-words text-white/45">
                      {row.clientName}
                      {row.clientCompany ? ` · ${row.clientCompany}` : ""}
                    </p>
                  </div>
                  <StatusBadge
                    label={row.source === "ticket" ? "Ticket" : "Contact"}
                    className="border-white/12 bg-white/5 text-white/75"
                  />
                </div>
                <p className="mt-3 text-sm text-accent">
                  {formatZar(totals.total)}
                </p>
                <p className="mt-1 text-xs text-white/45">
                  {row.invoice.sentAt
                    ? `Emailed ${formatDateTime(row.invoice.sentAt)}`
                    : "Saved, not yet emailed"}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
