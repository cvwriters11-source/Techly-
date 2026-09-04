import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/section";
import { StatusBadge } from "@/components/admin/detail-list";
import { requireClientUser, linkTicketsToUser } from "@/lib/client-auth";
import {
  formatDateTime,
  formatOrderNumber,
  statusTone,
  ticketStatusLabel,
  urgencyTone,
} from "@/lib/inbox/format";
import { listTicketsForClient } from "@/lib/inbox/store";
import { signOutClient } from "@/app/auth/actions";

export const metadata: Metadata = {
  title: "My tickets",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const user = await requireClientUser();
  await linkTicketsToUser(user);
  const tickets = await listTicketsForClient(user.id, user.email);

  return (
    <Section className="pt-6 pb-28 sm:pt-8 sm:pb-28">
      <Container>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              Client account
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white">
              Your tickets
            </h1>
            <p className="mt-2 max-w-xl text-sm text-white/60">
              Logged in as {user.email}. Open a ticket to follow up on work, or
              log a new one.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/ticket" variant="solid">
              Log a ticket
            </Button>
            <form action={signOutClient}>
              <Button type="submit" variant="ghost">
                Sign out
              </Button>
            </form>
          </div>
        </div>

        {tickets.length === 0 ? (
          <div className="mt-10 rounded-[1.8rem] border border-white/12 bg-[#0c0c0c] p-8">
            <p className="text-sm text-white/70">
              No tickets yet. Log one and it will show up here so you can track
              progress and send a follow-up.
            </p>
            <div className="mt-6">
              <Button href="/ticket">Log a ticket</Button>
            </div>
          </div>
        ) : (
          <div className="mt-10 overflow-hidden rounded-[1.8rem] border border-white/12 bg-[#0c0c0c]">
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/account/${ticket.id}`}
                className="block border-b border-white/8 px-5 py-5 last:border-b-0 transition hover:bg-white/[0.03]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">
                      {ticket.problems[0] || "Support ticket"}
                    </p>
                    <p className="mt-1 text-xs text-white/45">
                      {formatOrderNumber(ticket.id)} · {formatDateTime(ticket.createdAt)} · {ticket.company}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge
                      label={ticketStatusLabel(ticket.status)}
                      className={statusTone(ticket.status)}
                    />
                    <StatusBadge
                      label={ticket.urgency}
                      className={urgencyTone(ticket.urgency)}
                    />
                  </div>
                </div>
                {ticket.adminNote ? (
                  <p className="mt-3 line-clamp-2 text-sm text-white/70">
                    Latest update: {ticket.adminNote}
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-white/45">
                    No update from Techly yet.
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
