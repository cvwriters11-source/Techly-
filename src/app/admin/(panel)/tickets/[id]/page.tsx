import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { saveTicketUpdate } from "@/app/admin/actions";
import { DetailList, StatusBadge } from "@/components/admin/detail-list";
import { RecordUpdateForm } from "@/components/admin/record-update-form";
import {
  formatDateTime,
  statusTone,
  ticketStatusLabel,
  urgencyTone,
} from "@/lib/inbox/format";
import { isEmailConfigured } from "@/lib/email";
import { suggestedInvoiceNumber } from "@/lib/inbox/invoice";
import { getTicket } from "@/lib/inbox/store";

export const metadata: Metadata = {
  title: "Ticket details",
  robots: { index: false, follow: false },
};

export default async function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticket = await getTicket(id);
  if (!ticket) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/tickets" className="text-sm text-accent">
          ← All tickets
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold text-white">{ticket.name}</h1>
          <StatusBadge
            label={ticketStatusLabel(ticket.status)}
            className={statusTone(ticket.status)}
          />
          <StatusBadge
            label={ticket.urgency}
            className={urgencyTone(ticket.urgency)}
          />
        </div>
        <p className="mt-2 text-sm text-white/50">{ticket.id}</p>
      </div>

      <DetailList
        items={[
          { label: "Received", value: formatDateTime(ticket.createdAt) },
          { label: "Client type", value: ticket.clientType },
          { label: "Name", value: ticket.name },
          { label: "Company", value: ticket.company },
          {
            label: "Email",
            value: (
              <a href={`mailto:${ticket.email}`} className="text-accent">
                {ticket.email}
              </a>
            ),
          },
          {
            label: "Phone / WhatsApp",
            value: (
              <a href={`tel:${ticket.phone}`} className="text-accent">
                {ticket.phone}
              </a>
            ),
          },
          { label: "Preferred contact", value: ticket.contactMethod },
          { label: "Urgency", value: ticket.urgency },
          {
            label: "Problems",
            value: (
              <ul className="space-y-1">
                {ticket.problems.map((problem) => (
                  <li key={problem}>{problem}</li>
                ))}
              </ul>
            ),
          },
          { label: "Description", value: ticket.description },
          ...(ticket.clientFollowUp
            ? [
                {
                  label: "Client follow-up",
                  value: (
                    <>
                      {ticket.clientFollowUp}
                      {ticket.clientFollowUpAt ? (
                        <span className="mt-1 block text-xs text-white/45">
                          {formatDateTime(ticket.clientFollowUpAt)}
                        </span>
                      ) : null}
                    </>
                  ),
                },
              ]
            : []),
        ]}
      />

      <RecordUpdateForm
        action={saveTicketUpdate}
        id={ticket.id}
        status={ticket.status}
        note={ticket.adminNote}
        invoice={ticket.invoice}
        suggestedInvoiceNumber={suggestedInvoiceNumber(ticket.id)}
        notifyEmail={ticket.email}
        emailConfigured={isEmailConfigured()}
        statuses={[
          { value: "new", label: "New" },
          { value: "in_progress", label: "In progress" },
          { value: "resolved", label: "Resolved" },
        ]}
      />
    </div>
  );
}
