import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FollowUpForm } from "@/components/account/follow-up-form";
import { DetailList, StatusBadge } from "@/components/admin/detail-list";
import { Container, Section } from "@/components/ui/section";
import { requireClientUser } from "@/lib/client-auth";
import {
  formatDateTime,
  formatOrderNumber,
  statusTone,
  ticketStatusLabel,
  urgencyTone,
} from "@/lib/inbox/format";
import { getClientTicket } from "@/lib/inbox/store";

export const metadata: Metadata = {
  title: "Ticket follow-up",
  robots: { index: false, follow: false },
};

export default async function AccountTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireClientUser();
  const { id } = await params;
  const ticket = await getClientTicket(id, user.id, user.email);
  if (!ticket) notFound();

  return (
    <Section className="pt-6 pb-28 sm:pt-8 sm:pb-28">
      <Container className="max-w-3xl">
        <Link href="/account" className="text-sm text-accent">
          ← My tickets
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold text-white">
            {ticket.problems[0] || "Support ticket"}
          </h1>
          <StatusBadge
            label={ticketStatusLabel(ticket.status)}
            className={statusTone(ticket.status)}
          />
          <StatusBadge
            label={ticket.urgency}
            className={urgencyTone(ticket.urgency)}
          />
        </div>
        <p className="mt-2 text-sm text-white/50">
          Order number {formatOrderNumber(ticket.id)}
        </p>

        <div className="mt-8">
          <DetailList
            items={[
              { label: "Logged", value: formatDateTime(ticket.createdAt) },
              { label: "Company", value: ticket.company },
              { label: "What you reported", value: ticket.description },
              {
                label: "Techly update",
                value: ticket.adminNote || "No update yet.",
              },
              ...(ticket.clientFollowUp
                ? [
                    {
                      label: "Your last follow-up",
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
        </div>

        <div className="mt-8 rounded-[1.8rem] border border-white/12 bg-[#0c0c0c] p-5 sm:p-8">
          <h2 className="text-xl font-semibold text-white">Need a follow-up?</h2>
          <p className="mt-2 text-sm text-white/60">
            Send a note if something changed, the issue is still open, or you
            need the next step on this service.
          </p>
          <div className="mt-6">
            <FollowUpForm ticketId={ticket.id} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
