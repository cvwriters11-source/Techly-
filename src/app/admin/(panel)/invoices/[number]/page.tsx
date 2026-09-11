import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DetailList, StatusBadge } from "@/components/admin/detail-list";
import { formatDateTime, formatZar } from "@/lib/inbox/format";
import {
  invoiceTermsFor,
  invoiceTotals,
  lineTotal,
} from "@/lib/inbox/invoice";
import { getInvoiceFileRecord } from "@/lib/inbox/store";

export const metadata: Metadata = {
  title: "Invoice",
  robots: { index: false, follow: false },
};

export default async function AdminInvoiceDetailPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const decoded = decodeURIComponent(number);
  const row = await getInvoiceFileRecord(decoded);
  if (!row) notFound();

  const totals = invoiceTotals(row.invoice);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/invoices" className="text-sm text-accent">
          ← Invoice file
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold text-white">
            {row.invoice.number}
          </h1>
          <StatusBadge
            label={row.source === "ticket" ? "Ticket" : "Contact"}
            className="border-white/12 bg-white/5 text-white/75"
          />
        </div>
        <p className="mt-2 text-sm text-white/55">
          {row.invoice.sentAt
            ? `Emailed ${formatDateTime(row.invoice.sentAt)}`
            : "Saved in the invoice file"}
        </p>
      </div>

      <DetailList
        items={[
          { label: "Client", value: row.clientName },
          { label: "Company", value: row.clientCompany || "—" },
          {
            label: "Email",
            value: (
              <a href={`mailto:${row.clientEmail}`} className="text-accent">
                {row.clientEmail}
              </a>
            ),
          },
          {
            label: "Source",
            value: (
              <Link href={row.recordHref} className="text-accent">
                Open original {row.source}
              </Link>
            ),
          },
        ]}
      />

      <section className="overflow-hidden rounded-[1.4rem] border border-white/12 bg-[#0c0c0c]">
        <div className="border-b border-white/8 px-5 py-4">
          <h2 className="text-lg font-semibold text-white">Line items</h2>
        </div>
        {row.invoice.items.length === 0 ? (
          <p className="px-5 py-4 text-sm text-white/55">
            {row.invoice.description || "No line items recorded."}
          </p>
        ) : (
          <div className="divide-y divide-white/8">
            {row.invoice.items.map((item, index) => (
              <div
                key={`${item.description}-${index}`}
                className="grid gap-1 px-5 py-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-start sm:gap-6"
              >
                <div className="min-w-0">
                  <p className="text-sm text-white">{item.description}</p>
                  {item.details?.trim() ? (
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-white/55">
                      {item.details.trim()}
                    </p>
                  ) : null}
                </div>
                <p className="text-sm text-white/55">Qty {item.quantity}</p>
                <p className="text-sm text-white/55">
                  {formatZar(item.unitPrice)}
                </p>
                <p className="text-sm font-medium text-accent">
                  {formatZar(lineTotal(item))}
                </p>
              </div>
            ))}
          </div>
        )}
        <div className="space-y-2 border-t border-white/8 px-5 py-4 text-sm text-white/75">
          <p className="flex justify-between gap-4">
            <span>Items</span>
            <span>{formatZar(totals.itemsTotal)}</span>
          </p>
          {totals.callout > 0 ? (
            <p className="flex justify-between gap-4">
              <span>Call-out fee</span>
              <span>{formatZar(totals.callout)}</span>
            </p>
          ) : null}
          <p className="flex justify-between gap-4 font-semibold text-white">
            <span>Total</span>
            <span className="text-accent">{formatZar(totals.total)}</span>
          </p>
          <p className="flex justify-between gap-4 text-xs text-white/55">
            <span>Deposit due before work ({totals.depositPercent}%)</span>
            <span>{formatZar(totals.depositDue)}</span>
          </p>
          <p className="flex justify-between gap-4 text-xs text-white/55">
            <span>Balance due after work</span>
            <span>{formatZar(totals.balanceDue)}</span>
          </p>
          {row.invoice.depositPaidAt ? (
            <p className="mt-3 text-xs text-accent">
              Deposit marked paid {formatDateTime(row.invoice.depositPaidAt)}.
            </p>
          ) : null}
          {row.invoice.paidAt ? (
            <p className="mt-1 text-xs text-accent">
              Paid in full {formatDateTime(row.invoice.paidAt)}.
            </p>
          ) : null}
        </div>
      </section>

      <section className="rounded-[1.4rem] border border-white/12 bg-[#0c0c0c] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
          Terms
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/75">
          {invoiceTermsFor(row.invoice).map((term) => (
            <li key={term}>{term}</li>
          ))}
        </ul>
        {row.invoice.paymentDetails.trim() ? (
          <pre className="mt-5 whitespace-pre-wrap font-sans text-sm leading-relaxed text-white/70">
            {row.invoice.paymentDetails}
          </pre>
        ) : null}
      </section>
    </div>
  );
}
