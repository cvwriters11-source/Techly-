"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { logoutAdmin } from "@/app/admin/actions";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/tickets", label: "Tickets", countKey: "tickets" as const },
  { href: "/admin/contacts", label: "Contact us", countKey: "contacts" as const },
  { href: "/admin/projects", label: "Projects" },
];

function InboxBadge({ count, label }: { count: number; label: string }) {
  if (count < 1) return null;
  return (
    <span
      className="min-w-5 rounded-full bg-accent px-1.5 text-[11px] font-semibold leading-5 text-black"
      aria-label={`${count} new ${label}`}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}

export function AdminNav({
  newTickets = 0,
  newContacts = 0,
}: {
  newTickets?: number;
  newContacts?: number;
}) {
  const pathname = usePathname();
  const counts = { tickets: newTickets, contacts: newContacts };

  return (
    <header className="border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <div className="flex items-center gap-6">
          <Link href="/admin" aria-label="Admin home">
            <Logo compact />
          </Link>
          <nav className="hidden items-center gap-4 sm:flex">
            {links.map((link) => {
              const active =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(link.href);
              const count = link.countKey ? counts[link.countKey] : 0;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "inline-flex items-center gap-1.5 text-sm font-medium transition",
                    active ? "text-accent" : "text-white/70 hover:text-white",
                  )}
                >
                  {link.label}
                  <InboxBadge count={count} label={link.label} />
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-sm text-white/55 transition hover:text-white"
          >
            View site
          </Link>
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/80 transition hover:border-white/30 hover:text-white"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </form>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-5 pb-3 sm:hidden">
        {links.map((link) => {
          const active =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          const count = link.countKey ? counts[link.countKey] : 0;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm",
                active ? "bg-accent/15 text-accent" : "text-white/70",
              )}
            >
              {link.label}
              <InboxBadge count={count} label={link.label} />
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
