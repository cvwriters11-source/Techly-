import type { Metadata } from "next";
import Link from "next/link";
import {
  ClipboardList,
  Headset,
  Mail,
  TrendingUp,
} from "lucide-react";
import { StatusBadge } from "@/components/admin/detail-list";
import {
  contactStatusLabel,
  formatDateTime,
  formatOrderNumber,
  statusTone,
  ticketStatusLabel,
  urgencyTone,
} from "@/lib/inbox/format";
import { buildAdminRevenueStats } from "@/lib/admin/stats";
import { isOpenContactStatus, listInbox } from "@/lib/inbox/store";

export const metadata: Metadata = {
  title: "Admin dashboard",
  robots: { index: false, follow: false },
};

function RandIcon({ className }: { className?: string; strokeWidth?: number }) {
  return (
    <span
      className={`inline-flex size-5 items-center justify-center text-[1.05rem] font-bold leading-none ${className ?? ""}`}
      aria-hidden
    >
      R
    </span>
  );
}

function formatDashboardMoney(amount: number) {
  return `R ${amount.toFixed(2)}`;
}

export default async function AdminDashboardPage() {
  const { tickets, contacts } = await listInbox();
  const stats = buildAdminRevenueStats(tickets, contacts);
  const openTickets = tickets.filter((ticket) => ticket.status !== "resolved");
  const openContacts = contacts.filter((contact) =>
    isOpenContactStatus(contact.status),
  );

  const kpiCards = [
    {
      label: "Today",
      value: formatDashboardMoney(stats.today),
      icon: RandIcon,
      iconClass: "bg-accent",
    },
    {
      label: "This week",
      value: formatDashboardMoney(stats.week),
      icon: TrendingUp,
      iconClass: "bg-emerald-500",
    },
    {
      label: "This month",
      value: formatDashboardMoney(stats.month),
      icon: RandIcon,
      iconClass: "bg-sky-500",
    },
    {
      label: "All time",
      value: formatDashboardMoney(stats.allTime),
      icon: TrendingUp,
      iconClass: "bg-violet-500",
    },
    {
      label: "Total orders",
      value: String(stats.totalOrders),
      icon: ClipboardList,
      iconClass: "bg-sky-600",
    },
  ];

  const inboxCards = [
    {
      label: "Open tickets",
      value: String(stats.openTickets),
      icon: Headset,
      iconClass: "bg-orange-500",
      href: "/admin/tickets",
    },
    {
      label: "New contact requests",
      value: String(stats.newContacts),
      icon: Mail,
      iconClass: "bg-accent",
      href: "/admin/contacts",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          Inbox
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60">
          Welcome back! Here&apos;s an overview of your operations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="rounded-[1.4rem] border border-white/12 bg-[#0c0c0c] p-4 sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                {card.label}
              </p>
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-black sm:size-10 ${card.iconClass}`}
              >
                <card.icon className="size-5" strokeWidth={2.25} />
              </span>
            </div>
            <p className="mt-4 break-words text-2xl font-semibold tracking-tight text-white sm:mt-6 sm:text-3xl">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
        {inboxCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-[1.4rem] border border-white/12 bg-[#0c0c0c] p-4 transition hover:border-accent/40 sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                {card.label}
              </p>
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-black sm:size-10 ${card.iconClass}`}
              >
                <card.icon className="size-5" strokeWidth={2.25} />
              </span>
            </div>
            <p className="mt-4 text-2xl font-semibold tracking-tight text-white sm:mt-6 sm:text-3xl">
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <section className="rounded-[1.4rem] border border-white/12 bg-[#0c0c0c] p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-white sm:text-lg">
              Latest tickets
            </h2>
            <Link href="/admin/tickets" className="shrink-0 text-sm text-accent">
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
                      {formatOrderNumber(ticket.id)} · {formatDateTime(ticket.createdAt)} ·{" "}
                      {ticket.problems[0]}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-[1.4rem] border border-white/12 bg-[#0c0c0c] p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-white sm:text-lg">
              Contact us
            </h2>
            <Link href="/admin/contacts" className="shrink-0 text-sm text-accent">
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
