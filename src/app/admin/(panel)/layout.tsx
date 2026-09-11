import { requireAdmin } from "@/lib/admin/session";
import { AdminShell } from "@/components/admin/admin-shell";
import { countNewInbox } from "@/lib/inbox/store";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  const inbox = await countNewInbox();
  const adminEmail = process.env.ADMIN_EMAIL?.trim() || "admin@techlypc.co.za";

  return (
    <AdminShell
      newTickets={inbox.tickets}
      newContacts={inbox.contacts}
      adminEmail={adminEmail}
    >
      {children}
    </AdminShell>
  );
}
