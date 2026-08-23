import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/admin/detail-list";
import {
  contactStatusLabel,
  formatDateTime,
  statusTone,
} from "@/lib/inbox/format";
import { listInbox } from "@/lib/inbox/store";

export const metadata: Metadata = {
  title: "Contact us",
  robots: { index: false, follow: false },
};

export default async function AdminContactsPage() {
  const { contacts } = await listInbox();

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
          Full details from every Contact us form submission.
        </p>
      </div>

      {contacts.length === 0 ? (
        <p className="rounded-[1.4rem] border border-white/12 bg-[#0c0c0c] p-8 text-sm text-white/55">
          No contact requests yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-[1.4rem] border border-white/12 bg-[#0c0c0c]">
          {contacts.map((contact) => (
            <Link
              key={contact.id}
              href={`/admin/contacts/${contact.id}`}
              className="block border-b border-white/8 px-4 py-4 last:border-b-0 transition hover:bg-white/[0.03]"
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium break-words text-white">
                    {contact.name}
                  </p>
                  <p className="mt-0.5 text-xs break-words text-white/45">
                    {contact.company}
                  </p>
                </div>
                <StatusBadge
                  label={contactStatusLabel(contact.status)}
                  className={statusTone(contact.status)}
                />
              </div>
              <p className="mt-3 text-sm leading-snug break-words text-white/75">
                {contact.service}
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
          ))}
        </div>
      )}
    </div>
  );
}
