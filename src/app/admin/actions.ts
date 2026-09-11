"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminCredentialsMatch } from "@/lib/admin/auth";
import {
  clearAdminSession,
  createAdminSession,
  requireAdmin,
} from "@/lib/admin/session";
import { sendClientUpdateEmail, sendPaymentThankYouEmail } from "@/lib/email";
import {
  contactStatusLabel,
  formatDateTime,
  ticketStatusLabel,
} from "@/lib/inbox/format";
import {
  invoiceFromForm,
  invoiceIsSendable,
  suggestedInvoiceNumber,
  type InvoiceDetails,
} from "@/lib/inbox/invoice";
import {
  contactStatuses,
  deleteContact,
  getContact,
  getTicket,
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
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/admin");
  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedEmail || !expectedPassword) {
    return {
      ok: false,
      message:
        "Admin login is not configured. Add ADMIN_EMAIL and ADMIN_PASSWORD to .env.local and restart the server.",
    };
  }

  if (!adminCredentialsMatch(email, password)) {
    return { ok: false, message: "Incorrect email or password." };
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
  emailed?: boolean;
  invoiceNumber?: string;
  clientEmail?: string;
  redirectTo?: string;
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

  const existing = await getTicket(id);
  const invoiceToSave = parsedInvoice.include
    ? {
        ...parsedInvoice.invoice,
        depositPaidAt: existing?.invoice.depositPaidAt ?? null,
        paidAt: existing?.invoice.paidAt ?? null,
      }
    : null;

  const ticket = await updateTicket(id, {
    status,
    adminNote,
    ...(invoiceToSave ? { invoice: invoiceToSave } : {}),
  });
  revalidatePath("/admin");
  revalidatePath("/admin/tickets");
  revalidatePath(`/admin/tickets/${id}`);

  if (!ticket) {
    return { ok: false, message: "This ticket could not be updated." };
  }

  if (status === "resolved") {
    revalidatePath("/account");
    revalidatePath(`/account/${id}`);
  }

  if (!ticket.email) {
    if (status === "resolved") {
      redirect("/admin/tickets?resolved=1&email=missing");
    }
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
    note:
      ticket.adminNote ||
      (status === "resolved"
        ? "Your ticket has been marked as resolved. If you still need help, reply to this email."
        : ""),
    invoice: invoiceToSave,
  });

  if (emailed.ok && invoiceToSave) {
    await updateTicket(id, {
      invoice: {
        ...invoiceToSave,
        sentAt: new Date().toISOString(),
      },
    });
    revalidatePath(`/admin/tickets/${id}`);
  }

  if (status === "resolved" && !emailed.ok) {
    redirect("/admin/tickets?resolved=1&email=failed");
  }

  if (!emailed.ok) {
    return {
      ok: false,
      message: `Ticket updated, but the email to ${ticket.email} was not sent. ${emailed.error}`,
    };
  }

  revalidatePath("/admin/invoices");

  return {
    ok: true,
    emailed: true,
    clientEmail: ticket.email,
    invoiceNumber: invoiceToSave ? invoiceToSave.number : "",
    redirectTo: status === "resolved" ? "/admin/tickets" : undefined,
    message: invoiceToSave
      ? `The invoice ${invoiceToSave.number} was emailed to ${ticket.email} and saved in the invoice file.`
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

  const existing = await getContact(id);
  const invoiceToSave = parsedInvoice.include
    ? {
        ...parsedInvoice.invoice,
        depositPaidAt: existing?.invoice.depositPaidAt ?? null,
        paidAt: existing?.invoice.paidAt ?? null,
      }
    : null;

  const contact = await updateContact(id, {
    status,
    adminNote,
    ...(invoiceToSave ? { invoice: invoiceToSave } : {}),
  });
  revalidatePath("/admin");
  revalidatePath("/admin/contacts");
  revalidatePath(`/admin/contacts/${id}`);

  if (!contact) {
    return { ok: false, message: "This contact request could not be updated." };
  }

  if (!contact.email) {
    if (status === "closed") {
      redirect("/admin/contacts?closed=1&email=missing");
    }
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
    note:
      contact.adminNote ||
      (status === "closed"
        ? "Your enquiry has been marked as closed. If you still need help, reply to this email."
        : ""),
    invoice: invoiceToSave,
  });

  if (emailed.ok && invoiceToSave) {
    await updateContact(id, {
      invoice: {
        ...invoiceToSave,
        sentAt: new Date().toISOString(),
      },
    });
    revalidatePath(`/admin/contacts/${id}`);
  }

  if (status === "closed" && !emailed.ok) {
    redirect("/admin/contacts?closed=1&email=failed");
  }

  if (!emailed.ok) {
    return {
      ok: false,
      message: `Request updated, but the email to ${contact.email} was not sent. ${emailed.error}`,
    };
  }

  revalidatePath("/admin/invoices");

  return {
    ok: true,
    emailed: true,
    clientEmail: contact.email,
    invoiceNumber: invoiceToSave ? invoiceToSave.number : "",
    redirectTo: status === "closed" ? "/admin/contacts" : undefined,
    message: invoiceToSave
      ? `The invoice ${invoiceToSave.number} was emailed to ${contact.email} and saved in the invoice file.`
      : `Update emailed to ${contact.email}.`,
  };
}

export async function markInvoicePayment(
  _prev: RecordUpdateState,
  formData: FormData,
): Promise<RecordUpdateState> {
  await requireAdmin();
  const id = recordId(formData);
  const source = String(formData.get("source") ?? "").trim();
  const kind = String(formData.get("paymentKind") ?? "").trim();

  if (source !== "contact" && source !== "ticket") {
    return { ok: false, message: "Unknown record type." };
  }
  if (kind !== "deposit" && kind !== "full") {
    return { ok: false, message: "Choose deposit or full payment." };
  }

  const record =
    source === "contact" ? await getContact(id) : await getTicket(id);
  if (!record) {
    return { ok: false, message: "This record could not be found." };
  }

  if (!invoiceIsSendable(record.invoice)) {
    return {
      ok: false,
      message: "Add and save an invoice before marking a payment.",
    };
  }

  const now = new Date().toISOString();
  let nextInvoice: InvoiceDetails = { ...record.invoice };

  if (kind === "deposit") {
    if (record.invoice.depositPaidAt) {
      return {
        ok: false,
        message: `Deposit was already marked paid on ${formatDateTime(record.invoice.depositPaidAt)}.`,
      };
    }
    nextInvoice = { ...nextInvoice, depositPaidAt: now };
  } else {
    if (record.invoice.paidAt) {
      return {
        ok: false,
        message: `Full payment was already marked on ${formatDateTime(record.invoice.paidAt)}.`,
      };
    }
    nextInvoice = {
      ...nextInvoice,
      depositPaidAt: nextInvoice.depositPaidAt || now,
      paidAt: now,
    };
  }

  const updated =
    source === "contact"
      ? await updateContact(id, { invoice: nextInvoice })
      : await updateTicket(id, { invoice: nextInvoice });

  if (!updated) {
    return { ok: false, message: "The payment could not be saved." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/invoices");
  revalidatePath(
    source === "contact" ? `/admin/contacts/${id}` : `/admin/tickets/${id}`,
  );
  revalidatePath(
    source === "contact" ? "/admin/contacts" : "/admin/tickets",
  );

  if (!updated.email) {
    return {
      ok: false,
      message:
        "Payment marked, but this client has no email address so no thank-you email was sent.",
    };
  }

  const emailed = await sendPaymentThankYouEmail({
    to: updated.email,
    name: updated.name,
    company: updated.company,
    recordId: updated.id,
    invoice: nextInvoice,
    kind,
  });

  if (!emailed.ok) {
    return {
      ok: false,
      message: `Payment marked, but the thank-you email to ${updated.email} was not sent. ${emailed.error}`,
    };
  }

  return {
    ok: true,
    emailed: true,
    clientEmail: updated.email,
    invoiceNumber: nextInvoice.number,
    message:
      kind === "deposit"
        ? `Deposit marked paid and thank-you email sent to ${updated.email}.`
        : `Full payment marked and thank-you email sent to ${updated.email}.`,
  };
}

export async function deleteContactAction(formData: FormData) {
  await requireAdmin();
  const id = recordId(formData);
  if (!id) {
    redirect("/admin/contacts");
  }

  await deleteContact(id);
  revalidatePath("/admin");
  revalidatePath("/admin/contacts");
  revalidatePath("/admin/invoices");
  redirect("/admin/contacts?deleted=1");
}
