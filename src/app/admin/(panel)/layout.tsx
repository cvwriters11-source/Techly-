import { requireAdmin } from "@/lib/admin/session";
import { AdminNav } from "@/components/admin/admin-nav";
import { countNewInbox } from "@/lib/inbox/store";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  const inbox = await countNewInbox();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-black">
      <AdminNav newTickets={inbox.tickets} newContacts={inbox.contacts} />
      <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8 sm:py-10">
        {children}
      </div>
    </div>
  );
}
