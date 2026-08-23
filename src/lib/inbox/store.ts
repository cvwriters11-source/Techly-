import { randomBytes } from "node:crypto";
import { emptyInvoice, type InvoiceDetails } from "@/lib/inbox/invoice";
import { createAdminClient } from "@/lib/supabase/admin";

export const ticketStatuses = ["new", "in_progress", "resolved"] as const;
export const contactStatuses = ["new", "contacted", "closed"] as const;

export type TicketStatus = (typeof ticketStatuses)[number];
export type ContactStatus = (typeof contactStatuses)[number];
export type { InvoiceDetails };

export type TicketRecord = {
  id: string;
  createdAt: string;
  status: TicketStatus;
  adminNote: string;
  invoice: InvoiceDetails;
  clientType: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  problems: string[];
  urgency: string;
  contactMethod: string;
  description: string;
};

export type ContactRecord = {
  id: string;
  createdAt: string;
  status: ContactStatus;
  adminNote: string;
  invoice: InvoiceDetails;
  name: string;
  company: string;
  email: string;
  phone: string;
  service: string;
  description: string;
  budget: string;
  contactMethod: string;
};

type TicketRow = {
  id: string;
  created_at: string;
  status: TicketStatus;
  admin_note: string;
  client_type: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  problems: string[] | null;
  urgency: string;
  contact_method: string;
  description: string;
  invoice_number: string | null;
  invoice_description: string | null;
  invoice_amount: number | string | null;
  invoice_payment_details: string | null;
  invoice_sent_at: string | null;
};

type ContactRow = {
  id: string;
  created_at: string;
  status: ContactStatus;
  admin_note: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  service: string;
  description: string;
  budget: string;
  contact_method: string;
  invoice_number: string | null;
  invoice_description: string | null;
  invoice_amount: number | string | null;
  invoice_payment_details: string | null;
  invoice_sent_at: string | null;
};

function createId(prefix: string) {
  const stamp = Date.now().toString(36).toUpperCase();
  const noise = randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}-${stamp}-${noise}`;
}

function toAmount(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}

function invoiceFromRow(row: {
  invoice_number: string | null;
  invoice_description: string | null;
  invoice_amount: number | string | null;
  invoice_payment_details: string | null;
  invoice_sent_at: string | null;
}): InvoiceDetails {
  return {
    number: row.invoice_number ?? "",
    description: row.invoice_description ?? "",
    amount: toAmount(row.invoice_amount),
    paymentDetails: row.invoice_payment_details ?? "",
    sentAt: row.invoice_sent_at,
  };
}

function invoiceColumns(invoice?: InvoiceDetails) {
  const value = invoice ?? emptyInvoice();
  return {
    invoice_number: value.number,
    invoice_description: value.description,
    invoice_amount: value.amount,
    invoice_payment_details: value.paymentDetails,
    invoice_sent_at: value.sentAt,
  };
}

function mapTicket(row: TicketRow): TicketRecord {
  return {
    id: row.id,
    createdAt: row.created_at,
    status: row.status,
    adminNote: row.admin_note,
    invoice: invoiceFromRow(row),
    clientType: row.client_type,
    name: row.name,
    company: row.company,
    email: row.email,
    phone: row.phone,
    problems: Array.isArray(row.problems) ? row.problems : [],
    urgency: row.urgency,
    contactMethod: row.contact_method,
    description: row.description,
  };
}

function mapContact(row: ContactRow): ContactRecord {
  return {
    id: row.id,
    createdAt: row.created_at,
    status: row.status,
    adminNote: row.admin_note,
    invoice: invoiceFromRow(row),
    name: row.name,
    company: row.company,
    email: row.email,
    phone: row.phone,
    service: row.service,
    description: row.description,
    budget: row.budget,
    contactMethod: row.contact_method,
  };
}

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export async function saveTicket(
  input: Omit<
    TicketRecord,
    "id" | "createdAt" | "status" | "adminNote" | "invoice"
  >,
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("tickets")
    .insert({
      id: createId("TCK"),
      status: "new",
      admin_note: "",
      client_type: input.clientType,
      name: input.name,
      company: input.company,
      email: input.email,
      phone: input.phone,
      problems: input.problems,
      urgency: input.urgency,
      contact_method: input.contactMethod,
      description: input.description,
      ...invoiceColumns(),
    })
    .select()
    .single();

  throwIfError(error);
  return mapTicket(data as TicketRow);
}

export async function saveContact(
  input: Omit<
    ContactRecord,
    "id" | "createdAt" | "status" | "adminNote" | "invoice"
  >,
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("contacts")
    .insert({
      id: createId("CNT"),
      status: "new",
      admin_note: "",
      name: input.name,
      company: input.company,
      email: input.email,
      phone: input.phone,
      service: input.service,
      description: input.description,
      budget: input.budget,
      contact_method: input.contactMethod,
      ...invoiceColumns(),
    })
    .select()
    .single();

  throwIfError(error);
  return mapContact(data as ContactRow);
}

export async function listInbox() {
  const supabase = createAdminClient();
  const [tickets, contacts] = await Promise.all([
    supabase.from("tickets").select("*").order("created_at", { ascending: false }),
    supabase.from("contacts").select("*").order("created_at", { ascending: false }),
  ]);

  throwIfError(tickets.error);
  throwIfError(contacts.error);

  return {
    tickets: (tickets.data as TicketRow[]).map(mapTicket),
    contacts: (contacts.data as ContactRow[]).map(mapContact),
  };
}

export async function getTicket(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  throwIfError(error);
  return data ? mapTicket(data as TicketRow) : null;
}

export async function getContact(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  throwIfError(error);
  return data ? mapContact(data as ContactRow) : null;
}

export async function updateTicket(
  id: string,
  patch: Partial<Pick<TicketRecord, "status" | "adminNote" | "invoice">>,
) {
  const supabase = createAdminClient();
  const next: Record<string, unknown> = {};
  if (patch.status) next.status = patch.status;
  if (typeof patch.adminNote === "string") next.admin_note = patch.adminNote;
  if (patch.invoice) Object.assign(next, invoiceColumns(patch.invoice));

  const { data, error } = await supabase
    .from("tickets")
    .update(next)
    .eq("id", id)
    .select()
    .maybeSingle();

  throwIfError(error);
  return data ? mapTicket(data as TicketRow) : null;
}

export async function updateContact(
  id: string,
  patch: Partial<Pick<ContactRecord, "status" | "adminNote" | "invoice">>,
) {
  const supabase = createAdminClient();
  const next: Record<string, unknown> = {};
  if (patch.status) next.status = patch.status;
  if (typeof patch.adminNote === "string") next.admin_note = patch.adminNote;
  if (patch.invoice) Object.assign(next, invoiceColumns(patch.invoice));

  const { data, error } = await supabase
    .from("contacts")
    .update(next)
    .eq("id", id)
    .select()
    .maybeSingle();

  throwIfError(error);
  return data ? mapContact(data as ContactRow) : null;
}
