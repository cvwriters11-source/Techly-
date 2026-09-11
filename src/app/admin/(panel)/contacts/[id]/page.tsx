import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteContactAction, saveContactUpdate } from "@/app/admin/actions";
import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import { DetailList, StatusBadge } from "@/components/admin/detail-list";
import { RecordUpdateForm } from "@/components/admin/record-update-form";
import {
  contactStatusLabel,
  formatDateTime,
  formatOrderNumber,
  statusTone,
} from "@/lib/inbox/format";
import { isEmailConfigured } from "@/lib/email";
import { suggestedInvoiceNumber } from "@/lib/inbox/invoice";
import { getContact } from "@/lib/inbox/store";

export const metadata: Metadata = {
  title: "Contact details",
  robots: { index: false, follow: false },
};

export default async function AdminContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contact = await getContact(id);
  if (!contact) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/contacts" className="text-sm text-accent">
          ← All contact requests
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold text-white">{contact.name}</h1>
          <StatusBadge
            label={contactStatusLabel(contact.status)}
            className={statusTone(contact.status)}
          />
        </div>
        <p className="mt-2 text-sm text-white/55">
          Order number {formatOrderNumber(contact.id)}
        </p>
      </div>

      <DetailList
        items={[
          { label: "Received", value: formatDateTime(contact.createdAt) },
          { label: "Name", value: contact.name },
          { label: "Company", value: contact.company },
          {
            label: "Email",
            value: (
              <a href={`mailto:${contact.email}`} className="text-accent">
                {contact.email}
              </a>
            ),
          },
          {
            label: "Phone",
            value: (
              <a href={`tel:${contact.phone}`} className="text-accent">
                {contact.phone}
              </a>
            ),
          },
          { label: "Preferred contact", value: contact.contactMethod },
          { label: "Service", value: contact.service },
          { label: "Budget", value: contact.budget },
          { label: "Project description", value: contact.description },
        ]}
      />

      <RecordUpdateForm
        action={saveContactUpdate}
        id={contact.id}
        status={contact.status}
        note={contact.adminNote}
        invoice={contact.invoice}
        suggestedInvoiceNumber={suggestedInvoiceNumber(contact.id)}
        notifyEmail={contact.email}
        clientName={contact.name}
        emailConfigured={isEmailConfigured()}
        source="contact"
        statuses={[
          { value: "new", label: "New" },
          { value: "contacted", label: "Contacted" },
          { value: "closed", label: "Closed" },
          { value: "deposit_paid", label: "Deposit paid" },
          { value: "paid_in_full", label: "Full payment" },
        ]}
      />

      <ConfirmDeleteForm
        action={deleteContactAction}
        recordId={contact.id}
        label="Delete request"
        confirmMessage={`Delete ${contact.name}'s request? This cannot be undone, and the client will not be emailed.`}
        description="Remove this request from Contact us. Use this for tests or submissions that are not needed. The client is not emailed."
        className="rounded-[1.4rem] border border-white/12 bg-[#111] p-5"
      />
    </div>
  );
}
