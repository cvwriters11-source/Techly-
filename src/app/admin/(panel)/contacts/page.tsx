import type { Metadata } from "next";
import Link from "next/link";
import { deleteContactAction } from "@/app/admin/actions";
import { StatusBadge } from "@/components/admin/detail-list";
import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import {
  contactStatusLabel,
  formatDateTime,
  formatOrderNumber,
  statusTone,
} from "@/lib/inbox/format";
import { listInbox } from "@/lib/inbox/store";

export const metadata: Metadata = {
  title: "Contact us",
  robots: { index: false, follow: false },
};

export default async function AdminContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ closed?: string; email?: string; deleted?: string }>;
}) {
  const { closed, email, deleted } = await searchParams;
  const { contacts } = await listInbox();
  const openContacts = contacts.filter((contact) => contact.status !== "closed");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          Contact us
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">
          Consultation requests
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Open Contact us submissions. Closed requests leave this list after
          the client is emailed. Delete a request if it is a test or not
          needed — the client is not emailed.
        </p>
      </div>

      {deleted === "1" ? (
        <p
          role="status"
          className="rounded-xl border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-accent"
        >
          Request deleted.
        </p>
      ) : null}

      {closed === "1" ? (
        <p
          role="status"
          className={
            email === "failed" || email === "missing"
              ? "rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100"
              : "rounded-xl border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-accent"
          }
        >
          {email === "missing"
            ? "Request marked as closed and removed from this list, but this client has no email address."
            : email === "failed"
              ? "Request marked as closed and removed from this list, but the client email could not be sent. Add RESEND_API_KEY or SMTP details on the server."
              : "Request marked as closed and emailed to the client."}
        </p>
      ) : null}

      {openContacts.length === 0 ? (
        <p className="rounded-[1.4rem] border border-white/12 bg-[#0c0c0c] p-8 text-sm text-white/55">
          {contacts.length === 0
            ? "No contact requests yet."
            : "No open requests. Closed work has been emailed to the client and removed from this list."}
        </p>
      ) : (
        <div className="overflow-hidden rounded-[1.4rem] border border-white/12 bg-[#0c0c0c]">
          {openContacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-stretch border-b border-white/8 last:border-b-0 transition hover:bg-white/[0.03]"
            >
              <Link
                href={`/admin/contacts/${contact.id}`}
                className="min-w-0 flex-1 px-4 py-4"
              >
                <div className="min-w-0">
                  <p className="font-medium break-words text-white">
                    {contact.name}
                  </p>
                  <p className="mt-0.5 text-xs break-words text-white/45">
                    {formatOrderNumber(contact.id)}
                    {contact.company ? ` · ${contact.company}` : ""}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-snug break-words text-white/75">
                  {contact.service}
                </p>
                <p className="mt-1 line-clamp-2 text-sm leading-snug break-words text-white/55">
                  {contact.description}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge
                    label={contact.budget}
                    className="border-white/12 bg-white/5 text-white/80"
                  />
                  <span className="text-xs text-white/45">
                    {formatDateTime(contact.createdAt)}
                  </span>
                </div>
              </Link>
              <div className="flex shrink-0 flex-col items-end gap-3 px-3 py-4">
                <StatusBadge
                  label={contactStatusLabel(contact.status)}
                  className={statusTone(contact.status)}
                />
                <ConfirmDeleteForm
                  action={deleteContactAction}
                  recordId={contact.id}
                  label="Delete"
                  ariaLabel={`Delete ${contact.name}'s request`}
                  confirmMessage={`Delete ${contact.name}'s request? This cannot be undone, and the client will not be emailed.`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
