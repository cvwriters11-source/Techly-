import type { Metadata } from "next";
import Link from "next/link";
import { createSiteMessageAction } from "@/app/admin/messages/actions";
import { SiteMessageForm } from "@/components/admin/site-message-form";
import { listSiteMessages } from "@/lib/site-messages/store";

export const metadata: Metadata = {
  title: "Messages",
  robots: { index: false, follow: false },
};

export default async function AdminMessagesPage() {
  let messages: Awaited<ReturnType<typeof listSiteMessages>> = [];
  let loadError = "";

  try {
    messages = await listSiteMessages();
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Messages could not be loaded from the database.";
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          Site popup
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Messages</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/55">
          Promotions and warnings appear in the branded popup after 2 minutes on
          each public page, then again 4 minutes later. The quotation button
          always goes to Contact us.
        </p>
      </div>

      <SiteMessageForm action={createSiteMessageAction} submitLabel="Add message" />

      {loadError ? (
        <p className="rounded-[1.4rem] border border-amber-400/20 bg-amber-400/10 p-5 text-sm text-amber-100">
          {loadError}
        </p>
      ) : messages.length === 0 ? (
        <p className="rounded-[1.4rem] border border-white/12 bg-[#0c0c0c] p-8 text-sm text-white/55">
          No messages yet. The default Techly services pitch will show until you
          publish one.
        </p>
      ) : (
        <div className="overflow-hidden rounded-[1.4rem] border border-white/12 bg-[#0c0c0c]">
          {messages.map((message) => (
            <Link
              key={message.id}
              href={`/admin/messages/${message.id}`}
              className="block border-b border-white/8 px-4 py-4 last:border-b-0 transition hover:bg-white/[0.03]"
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium break-words text-white">{message.title}</p>
                <span
                  className={
                    message.kind === "warning"
                      ? "rounded-full bg-amber-400/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-200"
                      : "rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent"
                  }
                >
                  {message.kind}
                </span>
                <span className="text-[11px] uppercase tracking-wide text-white/45">
                  {message.active ? "Live" : "Draft"}
                </span>
              </div>
              <p className="mt-2 text-sm leading-snug break-words text-white/70">
                {message.body}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
