"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Briefcase,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  MessageSquare,
  Ticket,
  UserRound,
  X,
} from "lucide-react";
import { logoutAdmin } from "@/app/admin/actions";
import { AdminInboxAlerts } from "@/components/admin/admin-inbox-alerts";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/tickets", label: "Tickets", icon: Ticket, countKey: "tickets" as const },
  {
    href: "/admin/contacts",
    label: "Contact us",
    icon: Mail,
    countKey: "contacts" as const,
  },
  { href: "/admin/invoices", label: "Invoice file", icon: FileText },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
  { href: "/admin/career", label: "Career", icon: Briefcase },
  { href: "/admin/projects", label: "Projects", icon: ClipboardList },
];

function InboxBadge({ count, label }: { count: number; label: string }) {
  if (count < 1) return null;
  return (
    <span
      className="ml-auto min-w-5 rounded-full bg-accent px-1.5 text-[11px] font-semibold leading-5 text-black"
      aria-label={`${count} new ${label}`}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}

function NavItems({
  counts,
  onNavigate,
}: {
  counts: { tickets: number; contacts: number };
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {links.map((link) => {
        const active =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);
        const count = link.countKey ? counts[link.countKey] : 0;
        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-accent text-black"
                : "text-white/75 hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="truncate">{link.label}</span>
            <InboxBadge count={count} label={link.label} />
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({
  adminEmail,
  onNavigate,
}: {
  adminEmail: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="mt-auto space-y-3 border-t border-white/10 p-3">
      <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-black">
          <UserRound className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{adminEmail}</p>
          <p className="text-xs text-white/45">Admin</p>
        </div>
      </div>
      <Link
        href="/"
        onClick={onNavigate}
        className="block px-1 text-sm text-white/50 transition hover:text-white"
      >
        View site
      </Link>
      <form action={logoutAdmin}>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
        >
          <LogOut className="size-4" />
          Logout
        </button>
      </form>
    </div>
  );
}

export function AdminShell({
  children,
  newTickets = 0,
  newContacts = 0,
  adminEmail,
}: {
  children: React.ReactNode;
  newTickets?: number;
  newContacts?: number;
  adminEmail: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const counts = { tickets: newTickets, contacts: newContacts };

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <div className="flex min-h-full flex-1 bg-black text-white">
      {open ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[288px] flex-col border-r border-white/10 bg-[#0c0c0c] text-white transition-transform duration-200 lg:static lg:z-0 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          <p className="text-lg font-semibold text-white">Menu</p>
          <button
            type="button"
            aria-label="Close menu"
            className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setOpen(false)}
          >
            <X className="size-5" />
          </button>
        </div>

        <NavItems counts={counts} onNavigate={() => setOpen(false)} />
        <SidebarFooter
          adminEmail={adminEmail}
          onNavigate={() => setOpen(false)}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-black">
        <header className="sticky top-0 z-30 flex min-w-0 items-center justify-between gap-2 border-b border-white/10 bg-black/80 px-3 py-2.5 backdrop-blur sm:gap-3 sm:px-4 sm:py-3 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Open menu"
              className="shrink-0 rounded-lg border border-white/15 bg-white/5 p-2 text-white/80 transition hover:border-white/30 hover:text-white lg:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu className="size-5" />
            </button>
            <p className="truncate text-sm font-semibold text-white lg:hidden">
              Techly admin
            </p>
          </div>
          <div className="min-w-0 shrink">
            <AdminInboxAlerts />
          </div>
        </header>

        <div className="mx-auto w-full max-w-6xl min-w-0 flex-1 px-3 py-5 sm:px-8 sm:py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
