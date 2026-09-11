import {
  invoiceTotals,
  type InvoiceDetails,
} from "@/lib/inbox/invoice";
import type { ContactRecord, TicketRecord } from "@/lib/inbox/store";

export type AdminRevenueStats = {
  today: number;
  week: number;
  month: number;
  allTime: number;
  totalOrders: number;
  openTickets: number;
  urgentTickets: number;
  newContacts: number;
};

type PaymentEvent = { at: Date; amount: number };

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date) {
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const start = startOfDay(date);
  start.setDate(start.getDate() + mondayOffset);
  return start;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function paymentEvents(invoice: InvoiceDetails): PaymentEvent[] {
  const totals = invoiceTotals(invoice);
  const events: PaymentEvent[] = [];

  if (invoice.paidAt) {
    const at = new Date(invoice.paidAt);
    if (!Number.isNaN(at.getTime()) && totals.total > 0) {
      events.push({ at, amount: totals.total });
    }
    return events;
  }

  if (invoice.depositPaidAt) {
    const at = new Date(invoice.depositPaidAt);
    if (!Number.isNaN(at.getTime()) && totals.depositDue > 0) {
      events.push({ at, amount: totals.depositDue });
    }
  }

  return events;
}

function sumSince(events: PaymentEvent[], since: Date | null) {
  return events.reduce((sum, event) => {
    if (since && event.at < since) return sum;
    return sum + event.amount;
  }, 0);
}

export function buildAdminRevenueStats(
  tickets: TicketRecord[],
  contacts: ContactRecord[],
  now = new Date(),
): AdminRevenueStats {
  const events = [...tickets, ...contacts].flatMap((record) =>
    paymentEvents(record.invoice),
  );

  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);

  const openTickets = tickets.filter((ticket) => ticket.status !== "resolved");
  const urgentTickets = openTickets.filter((ticket) =>
    ticket.urgency.toLowerCase().includes("urgent"),
  );
  const newContacts = contacts.filter((contact) => contact.status === "new");

  return {
    today: sumSince(events, todayStart),
    week: sumSince(events, weekStart),
    month: sumSince(events, monthStart),
    allTime: sumSince(events, null),
    totalOrders: tickets.length + contacts.length,
    openTickets: openTickets.length,
    urgentTickets: urgentTickets.length,
    newContacts: newContacts.length,
  };
}
