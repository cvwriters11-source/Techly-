import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  deleteSiteMessageAction,
  updateSiteMessageAction,
} from "@/app/admin/messages/actions";
import { SiteMessageForm } from "@/components/admin/site-message-form";
import { getSiteMessage } from "@/lib/site-messages/store";

export const metadata: Metadata = {
  title: "Edit message",
  robots: { index: false, follow: false },
};

export default async function AdminMessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const message = await getSiteMessage(id);
  if (!message) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/messages" className="text-sm text-accent">
          ← All messages
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-white">{message.title}</h1>
        <p className="mt-2 text-sm break-all text-white/55">{message.id}</p>
      </div>

      <SiteMessageForm
        action={updateSiteMessageAction}
        message={message}
        submitLabel="Save message"
      />

      <form
        action={deleteSiteMessageAction}
        className="rounded-[1.4rem] border border-white/12 bg-[#111] p-5"
      >
        <input type="hidden" name="recordId" value={message.id} />
        <p className="text-sm text-white/55">
          Remove this message. The popup will use the next live message, or the
          default services pitch.
        </p>
        <button
          type="submit"
          className="mt-4 text-sm text-red-300 transition hover:text-red-200"
        >
          Delete message
        </button>
      </form>
    </div>
  );
}
