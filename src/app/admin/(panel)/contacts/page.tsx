import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  deleteContactAction,
  sendBulkMarketingAction,
  sendContactCampaignAction,
} from "@/app/admin/actions";
import { StatusBadge } from "@/components/admin/detail-list";
import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import { BulkMarketingForm } from "@/components/admin/bulk-marketing-form";
import { MarketingBlastPopup } from "@/components/admin/admin-email-sent-popup";
import {
  contactStatusLabel,
  formatDateTime,
  formatOrderNumber,
  statusTone,
} from "@/lib/inbox/format";
import {
  isMarketingAudience,
  type MarketingAudience,
} from "@/lib/inbox/marketing-templates";
import {
  isFollowUpContactStatus,
  isOpenContactStatus,
  isPaidContactStatus,
  listInbox,
  type ContactRecord,
} from "@/lib/inbox/store";

export const metadata: Metadata = {
  title: "Contact us",
  robots: { index: false, follow: false },
};

type ContactView = "open" | "paid" | "followup" | "marketing";

type MarketingRecipient = {
  email: string;
  name: string;
  company: string;
  sources: string[];
};

function ContactRow({
  contact,
  campaignKind,
  campaignLabel,
}: {
  contact: ContactRecord;
  campaignKind?: "lead_reminder" | "paid_marketing";
  campaignLabel?: string;
}) {
  return (
    <div className="flex items-stretch border-b border-white/8 last:border-b-0 transition hover:bg-white/[0.03]">
      <Link
        href={`/admin/contacts/${contact.id}`}
        className="min-w-0 flex-1 px-4 py-4"
      >
        <div className="min-w-0">
          <p className="font-medium break-words text-white">{contact.name}</p>
          <p className="mt-0.5 text-xs break-words text-white/45">
            {formatOrderNumber(contact.id)}
            {contact.company ? ` · ${contact.company}` : ""}
            {contact.email ? ` · ${contact.email}` : ""}
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
            className="border-white/12 bg-white/5 text-white/75"
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
        {campaignKind && campaignLabel ? (
          <form action={sendContactCampaignAction}>
            <input type="hidden" name="recordId" value={contact.id} />
            <input type="hidden" name="campaignKind" value={campaignKind} />
            <button
              type="submit"
              className="rounded-full border border-accent/40 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/10"
            >
              {campaignLabel}
            </button>
          </form>
        ) : null}
        <ConfirmDeleteForm
          action={deleteContactAction}
          recordId={contact.id}
          label="Delete"
          ariaLabel={`Delete ${contact.name}'s request`}
          confirmMessage={`Delete ${contact.name}'s request? This cannot be undone, and the client will not be emailed.`}
        />
      </div>
    </div>
  );
}

function contactSourceLabel(status: ContactRecord["status"]) {
  if (isPaidContactStatus(status)) return "Paid client";
  if (isFollowUpContactStatus(status)) return "Follow-up lead";
  return "Open request";
}

function collectMarketingRecipients(
  contacts: ContactRecord[],
  audience: MarketingAudience,
): MarketingRecipient[] {
  const byEmail = new Map<string, MarketingRecipient>();

  const includeContact =
    audience === "all"
      ? () => true
      : audience === "paid"
        ? isPaidContactStatus
        : audience === "followup"
          ? isFollowUpContactStatus
          : isOpenContactStatus;

  for (const contact of contacts) {
    const email = contact.email.trim();
    if (!email || !includeContact(contact.status)) continue;
    const key = email.toLowerCase();
    const existing = byEmail.get(key);
    const source = contactSourceLabel(contact.status);
    if (existing) {
      if (!existing.sources.includes(source)) existing.sources.push(source);
      continue;
    }
    byEmail.set(key, {
      email,
      name: contact.name.trim(),
      company: contact.company.trim(),
      sources: [source],
    });
  }

  return [...byEmail.values()].sort((a, b) =>
    a.email.localeCompare(b.email, undefined, { sensitivity: "base" }),
  );
}

export default async function AdminContactsPage({
  searchParams,
}: {
  searchParams: Promise<{
    closed?: string;
    email?: string;
    deleted?: string;
    view?: string;
    campaign?: string;
    audience?: string;
    blast?: string;
    sent?: string;
    failed?: string;
  }>;
}) {
  const {
    closed,
    email,
    deleted,
    view: viewRaw,
    campaign,
    audience: audienceRaw,
    blast,
    sent,
    failed,
  } = await searchParams;
  const view: ContactView =
    viewRaw === "paid" ||
    viewRaw === "followup" ||
    viewRaw === "marketing"
      ? viewRaw
      : "open";
  const audience: MarketingAudience = isMarketingAudience(audienceRaw ?? "")
    ? (audienceRaw as MarketingAudience)
    : "all";

  const { contacts } = await listInbox();
  const openContacts = contacts.filter((contact) =>
    isOpenContactStatus(contact.status),
  );
  const paidContacts = contacts.filter((contact) =>
    isPaidContactStatus(contact.status),
  );
  const followUpContacts = contacts.filter((contact) =>
    isFollowUpContactStatus(contact.status),
  );
  const marketingRecipients = collectMarketingRecipients(contacts, audience);
  const allContactEmails = collectMarketingRecipients(contacts, "all");
  const allEmailsCount = allContactEmails.length;

  const visible =
    view === "paid"
      ? paidContacts
      : view === "followup"
        ? followUpContacts
        : view === "marketing"
          ? []
          : openContacts;

  const tabs: { id: ContactView; label: string; count: number }[] = [
    { id: "open", label: "Open", count: openContacts.length },
    { id: "paid", label: "Paid clients", count: paidContacts.length },
    {
      id: "followup",
      label: "Follow-up leads",
      count: followUpContacts.length,
    },
    { id: "marketing", label: "Marketing", count: allEmailsCount },
  ];

  const audienceTabs: { id: MarketingAudience; label: string }[] = [
    { id: "all", label: "Everyone" },
    { id: "paid", label: "Paid clients" },
    { id: "followup", label: "Follow-up leads" },
    { id: "open", label: "Open requests" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          Contact us
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">
          Consultation requests
        </h1>
        <p className="mt-2 text-sm text-white/55">
          Open requests stay here while you quote. Deposit paid and full payment
          clients are kept for marketing. Closed leads stay under Follow-up for
          gentle reminders. Use Marketing to email everyone in your system when
          you have an update.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={
                tab.id === "marketing"
                  ? `/admin/contacts?view=marketing&audience=${audience}`
                  : `/admin/contacts?view=${tab.id}`
              }
              className={
                view === tab.id
                  ? "rounded-full bg-accent px-4 py-2 text-sm font-semibold text-black"
                  : "rounded-full border border-white/12 px-4 py-2 text-sm font-medium text-white/70 hover:border-white/30 hover:text-white"
              }
            >
              {tab.label} ({tab.count})
            </Link>
          ))}
        </div>

        {view === "marketing" ? (
          <div className="flex flex-wrap gap-2 border-l border-white/12 pl-3">
            {audienceTabs.map((tab) => (
              <Link
                key={tab.id}
                href={`/admin/contacts?view=marketing&audience=${tab.id}`}
                className={
                  audience === tab.id
                    ? "rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black"
                    : "rounded-full border border-white/12 px-3 py-1.5 text-xs font-medium text-white/55 hover:border-white/30 hover:text-white"
                }
              >
                {tab.label}
              </Link>
            ))}
          </div>
        ) : null}
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
            ? "Request marked as closed, but this client has no email address."
            : email === "failed"
              ? "Request marked as closed, but the client email could not be sent. Add RESEND_API_KEY or SMTP details on the server."
              : "Request marked as closed and emailed to the client. Kept under Follow-up leads."}
        </p>
      ) : null}

      {campaign === "1" ? (
        <p
          role="status"
          className="rounded-xl border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-accent"
        >
          Campaign email sent to the client.
        </p>
      ) : null}
      {campaign === "failed" ? (
        <p
          role="status"
          className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100"
        >
          The campaign email could not be sent. Check SMTP or Resend settings.
        </p>
      ) : null}
      {campaign === "missing" ? (
        <p
          role="status"
          className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100"
        >
          This client has no email address.
        </p>
      ) : null}

      <Suspense fallback={null}>
        <MarketingBlastPopup
          blast={blast}
          sent={sent}
          failed={failed}
          audience={audience}
        />
      </Suspense>

      {view === "marketing" ? (
        <div className="space-y-6">
          <BulkMarketingForm
            action={sendBulkMarketingAction}
            audience={audience}
            recipientCount={allEmailsCount}
          />

          {marketingRecipients.length === 0 ? (
            <p className="rounded-[1.4rem] border border-white/12 bg-[#0c0c0c] p-8 text-sm text-white/55">
              No email addresses in this audience yet.
            </p>
          ) : (
            <div className="overflow-hidden rounded-[1.4rem] border border-white/12 bg-[#0c0c0c]">
              <div className="border-b border-white/8 px-4 py-3">
                <p className="text-sm font-medium text-white">
                  Email list ({marketingRecipients.length})
                </p>
                <p className="mt-1 text-xs text-white/45">
                  Unique Contact us addresses
                  {audience === "all"
                    ? ". Send to all reaches every Contact us email."
                    : " in this audience. Send to all still emails every Contact us address."}
                </p>
              </div>
              {marketingRecipients.map((recipient) => (
                <div
                  key={recipient.email}
                  className="flex flex-wrap items-start justify-between gap-3 border-b border-white/8 px-4 py-3 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="font-medium break-all text-white">
                      {recipient.email}
                    </p>
                    <p className="mt-0.5 text-xs text-white/45">
                      {[recipient.name, recipient.company]
                        .filter(Boolean)
                        .join(" · ") || "No name on file"}
                    </p>
                  </div>
                  <p className="text-xs text-white/55">
                    {recipient.sources.join(" · ")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : visible.length === 0 ? (
        <p className="rounded-[1.4rem] border border-white/12 bg-[#0c0c0c] p-8 text-sm text-white/55">
          {view === "paid"
            ? "No paid clients yet. When you mark Deposit paid or Full payment, they appear here for future marketing emails."
            : view === "followup"
              ? "No follow-up leads yet. Closed enquiries that did not become paid clients appear here for gentle reminders."
              : contacts.length === 0
                ? "No contact requests yet."
                : "No open requests right now."}
        </p>
      ) : (
        <div className="overflow-hidden rounded-[1.4rem] border border-white/12 bg-[#0c0c0c]">
          {visible.map((contact) => (
            <ContactRow
              key={contact.id}
              contact={contact}
              campaignKind={
                view === "paid"
                  ? "paid_marketing"
                  : view === "followup"
                    ? "lead_reminder"
                    : undefined
              }
              campaignLabel={
                view === "paid"
                  ? "Send marketing email"
                  : view === "followup"
                    ? "Send gentle reminder"
                    : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
