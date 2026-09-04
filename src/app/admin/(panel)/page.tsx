import type { Metadata } from "next";
import Link from "next/link";
import { Headset, Mail, Ticket } from "lucide-react";
import { StatusBadge } from "@/components/admin/detail-list";
import {
  contactStatusLabel,
  formatDateTime,
  formatOrderNumber,
  statusTone,
  ticketStatusLabel,
  urgencyTone,
} from "@/lib/inbox/format";
import { listInbox } from "@/lib/inbox/store";

export const metadata: Metadata = {
  title: "Admin dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const { tickets, contacts } = await listInbox();
  const openTickets = tickets.filter((ticket) => ticket.status !== "resolved");
  const urgentTickets = tickets.filter(
    (ticket) =>
      ticket.status !== "resolved" &&
      ticket.urgency.toLowerCase().includes("urgent"),
  );
  const newContacts = contacts.filter((contact) => contact.status === "new");
  const openContacts = contacts.filter((contact) => contact.status !== "closed");

  const stats = [
    {
      label: "Open tickets",
      value: openTickets.length,
      icon: Ticket,
    },
    {
      label: "Urgent tickets",
      value: urgentTickets.length,
      icon: Headset,
    },
    {
      label: "New contact requests",
      value: newContacts.length,
      icon: Mail,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          Inbox
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Admin dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/60">
          Every Log a Ticket and Contact us submission is stored here with the
          full client details. Add completed work under{" "}
          <Link href="/admin/projects" className="text-accent hover:text-white">
            Projects
          </Link>{" "}
          to show it on the site as Our Profile.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-[1.4rem] border border-white/12 bg-[#0c0c0c] p-5"
          >
            <stat.icon className="size-5 text-accent" />
            <p className="mt-4 text-3xl font-semibold text-white">{stat.value}</p>
            <p className="mt-1 text-sm text-white/55">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[1.4rem] border border-white/12 bg-[#0c0c0c] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Latest tickets</h2>
            <Link href="/admin/tickets" className="text-sm text-accent">
              View all
            </Link>
          </div>
          {openTickets.length === 0 ? (
            <p className="text-sm text-white/50">
              {tickets.length === 0
                ? "No tickets yet. New Log a Ticket submissions will appear here."
                : "No open tickets. Resolved tickets are emailed to the client and leave this list."}
            </p>
          ) : (
            <ul className="space-y-3">
              {openTickets.slice(0, 6).map((ticket) => (
                <li key={ticket.id}>
                  <Link
                    href={`/admin/tickets/${ticket.id}`}
                    className="block rounded-xl border border-white/8 px-4 py-3 transition hover:border-accent/40"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-white">{ticket.name}</p>
                      <StatusBadge
                        label={ticketStatusLabel(ticket.status)}
                        className={statusTone(ticket.status)}
                      />
                      <StatusBadge
                        label={ticket.urgency}
                        className={urgencyTone(ticket.urgency)}
                      />
                    </div>
                    <p className="mt-1 text-sm text-white/55">{ticket.company}</p>
                    <p className="mt-1 text-xs text-white/40">
                      {formatOrderNumber(ticket.id)} · {formatDateTime(ticket.createdAt)} · {ticket.problems[0]}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-[1.4rem] border border-white/12 bg-[#0c0c0c] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Contact us</h2>
            <Link href="/admin/contacts" className="text-sm text-accent">
              View all
            </Link>
          </div>
          {openContacts.length === 0 ? (
            <p className="text-sm text-white/50">
              {contacts.length === 0
                ? "No consultation requests yet. Contact us form submissions will appear here."
                : "No open requests. Closed requests leave this list."}
            </p>
          ) : (
            <ul className="space-y-3">
              {openContacts.slice(0, 6).map((contact) => (
                <li key={contact.id}>
                  <Link
                    href={`/admin/contacts/${contact.id}`}
                    className="block rounded-xl border border-white/8 px-4 py-3 transition hover:border-accent/40"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-white">{contact.name}</p>
                      <StatusBadge
                        label={contactStatusLabel(contact.status)}
                        className={statusTone(contact.status)}
                      />
                    </div>
                    <p className="mt-1 text-sm text-white/55">
                      {contact.company} · {contact.service}
                    </p>
                    <p className="mt-1 text-xs text-white/40">
                      {formatOrderNumber(contact.id)} · {formatDateTime(contact.createdAt)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
