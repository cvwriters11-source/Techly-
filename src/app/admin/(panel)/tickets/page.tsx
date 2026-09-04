import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/admin/detail-list";
import {
  formatDateTime,
  statusTone,
  ticketStatusLabel,
  urgencyTone,
} from "@/lib/inbox/format";
import { listInbox } from "@/lib/inbox/store";

export const metadata: Metadata = {
  title: "Tickets",
  robots: { index: false, follow: false },
};

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ resolved?: string; email?: string }>;
}) {
  const { resolved, email } = await searchParams;
  const { tickets } = await listInbox();
  const openTickets = tickets.filter((ticket) => ticket.status !== "resolved");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          Log a Ticket
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Tickets</h1>
        <p className="mt-2 text-sm text-white/60">
          Open tickets from the site. Resolved tickets leave this list after
          the client is emailed.
        </p>
      </div>

      {resolved === "1" ? (
        <p
          role="status"
          className={
            email === "failed" || email === "missing"
              ? "rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100"
              : "rounded-xl border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-accent"
          }
        >
          {email === "missing"
            ? "Ticket marked as resolved and removed from this list, but this client has no email address."
            : email === "failed"
              ? "Ticket marked as resolved and removed from this list, but the client email could not be sent. Add RESEND_API_KEY or SMTP details on the server."
              : "Ticket marked as resolved and emailed to the client."}
        </p>
      ) : null}

      {openTickets.length === 0 ? (
        <p className="rounded-[1.4rem] border border-white/12 bg-[#0c0c0c] p-8 text-sm text-white/55">
          {tickets.length === 0
            ? "No tickets yet."
            : "No open tickets. Resolved work has been emailed to the client and removed from this list."}
        </p>
      ) : (
        <div className="overflow-hidden rounded-[1.4rem] border border-white/12 bg-[#0c0c0c]">
          {openTickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/admin/tickets/${ticket.id}`}
              className="block border-b border-white/8 px-4 py-4 last:border-b-0 transition hover:bg-white/[0.03]"
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium break-words text-white">
                    {ticket.name}
                  </p>
                  <p className="mt-0.5 text-xs break-words text-white/45">
                    {ticket.company}
                  </p>
                </div>
                <StatusBadge
                  label={ticketStatusLabel(ticket.status)}
                  className={statusTone(ticket.status)}
                />
              </div>
              <p className="mt-3 text-sm leading-snug break-words text-white/75">
                {ticket.problems[0]}
                {ticket.problems.length > 1
                  ? ` +${ticket.problems.length - 1}`
                  : ""}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusBadge
                  label={ticket.urgency}
                  className={urgencyTone(ticket.urgency)}
                />
                <span className="text-xs text-white/45">
                  {formatDateTime(ticket.createdAt)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
