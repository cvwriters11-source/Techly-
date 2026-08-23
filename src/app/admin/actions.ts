"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { passwordsMatch } from "@/lib/admin/auth";
import {
  clearAdminSession,
  createAdminSession,
  requireAdmin,
} from "@/lib/admin/session";
import { sendClientUpdateEmail } from "@/lib/email";
import {
  contactStatusLabel,
  ticketStatusLabel,
} from "@/lib/inbox/format";
import { invoiceFromForm, suggestedInvoiceNumber } from "@/lib/inbox/invoice";
import {
  contactStatuses,
  ticketStatuses,
  updateContact,
  updateTicket,
  type ContactStatus,
  type TicketStatus,
} from "@/lib/inbox/store";

export type AdminLoginState = {
  ok: boolean;
  message: string;
};

export async function loginAdmin(
  _prev: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/admin");
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return {
      ok: false,
      message: "ADMIN_PASSWORD is not set. Add it to .env.local and restart the server.",
    };
  }

  if (!passwordsMatch(password, expected)) {
    return { ok: false, message: "Incorrect password." };
  }

  await createAdminSession();
  redirect(from.startsWith("/admin") ? from : "/admin");
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}

export type RecordUpdateState = {
  ok: boolean;
  message: string;
};

function recordId(formData: FormData) {
  return String(formData.get("recordId") ?? formData.get("id") ?? "");
}

export async function saveTicketUpdate(
  _prev: RecordUpdateState,
  formData: FormData,
): Promise<RecordUpdateState> {
  await requireAdmin();
  const id = recordId(formData);
  const status = String(formData.get("status") ?? "") as TicketStatus;
  const adminNote = String(formData.get("adminNote") ?? "").trim();

  if (!ticketStatuses.includes(status)) {
    return { ok: false, message: "Please choose a valid status." };
  }

  const parsedInvoice = invoiceFromForm(formData, suggestedInvoiceNumber(id));
  if (!parsedInvoice.ok) {
    return { ok: false, message: parsedInvoice.message };
  }

  const ticket = await updateTicket(id, {
    status,
    adminNote,
    invoice: parsedInvoice.invoice,
  });
  revalidatePath("/admin");
  revalidatePath("/admin/tickets");
  revalidatePath(`/admin/tickets/${id}`);

  if (!ticket) {
    return { ok: false, message: "This ticket could not be updated." };
  }

  if (!ticket.email) {
    return {
      ok: false,
      message: "Ticket updated, but this client has no email address.",
    };
  }

  const emailed = await sendClientUpdateEmail({
    to: ticket.email,
    name: ticket.name,
    company: ticket.company,
    recordId: ticket.id,
    recordLabel: "support ticket",
    statusLabel: ticketStatusLabel(ticket.status),
    note: ticket.adminNote,
    invoice: parsedInvoice.include ? parsedInvoice.invoice : null,
  });

  if (emailed.ok && parsedInvoice.include) {
    await updateTicket(id, {
      invoice: {
        ...parsedInvoice.invoice,
        sentAt: new Date().toISOString(),
      },
    });
    revalidatePath(`/admin/tickets/${id}`);
  }

  if (!emailed.ok) {
    return {
      ok: false,
      message: `Ticket updated, but the email to ${ticket.email} was not sent. ${emailed.error}`,
    };
  }

  return {
    ok: true,
    message: parsedInvoice.include
      ? `Update and invoice emailed to ${ticket.email}.`
      : `Update emailed to ${ticket.email}.`,
  };
}

export async function saveContactUpdate(
  _prev: RecordUpdateState,
  formData: FormData,
): Promise<RecordUpdateState> {
  await requireAdmin();
  const id = recordId(formData);
  const status = String(formData.get("status") ?? "") as ContactStatus;
  const adminNote = String(formData.get("adminNote") ?? "").trim();

  if (!contactStatuses.includes(status)) {
    return { ok: false, message: "Please choose a valid status." };
  }

  const parsedInvoice = invoiceFromForm(formData, suggestedInvoiceNumber(id));
  if (!parsedInvoice.ok) {
    return { ok: false, message: parsedInvoice.message };
  }

  const contact = await updateContact(id, {
    status,
    adminNote,
    invoice: parsedInvoice.invoice,
  });
  revalidatePath("/admin");
  revalidatePath("/admin/contacts");
  revalidatePath(`/admin/contacts/${id}`);

  if (!contact) {
    return { ok: false, message: "This contact request could not be updated." };
  }

  if (!contact.email) {
    return {
      ok: false,
      message: "Request updated, but this client has no email address.",
    };
  }

  const emailed = await sendClientUpdateEmail({
    to: contact.email,
    name: contact.name,
    company: contact.company,
    recordId: contact.id,
    recordLabel: "enquiry",
    statusLabel: contactStatusLabel(contact.status),
    note: contact.adminNote,
    invoice: parsedInvoice.include ? parsedInvoice.invoice : null,
  });

  if (emailed.ok && parsedInvoice.include) {
    await updateContact(id, {
      invoice: {
        ...parsedInvoice.invoice,
        sentAt: new Date().toISOString(),
      },
    });
    revalidatePath(`/admin/contacts/${id}`);
  }

  if (!emailed.ok) {
    return {
      ok: false,
      message: `Request updated, but the email to ${contact.email} was not sent. ${emailed.error}`,
    };
  }

  return {
    ok: true,
    message: parsedInvoice.include
      ? `Update and invoice emailed to ${contact.email}.`
      : `Update emailed to ${contact.email}.`,
  };
}
