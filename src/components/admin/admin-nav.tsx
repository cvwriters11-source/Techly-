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
  { href: "/admin/invoices", label: "Invoice file" },
  { href: "/admin/messages", label: "Messages" },
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

function NavLinks({
  counts,
  variant,
}: {
  counts: { tickets: number; contacts: number };
  variant: "inline" | "chips";
}) {
  const pathname = usePathname();

  return links.map((link) => {
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
          "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-medium transition",
          variant === "chips" && "rounded-full px-3 py-1.5",
          active
            ? variant === "chips"
              ? "bg-accent/15 text-accent"
              : "text-accent"
            : "text-white/70 hover:text-white",
        )}
      >
        {link.label}
        <InboxBadge count={count} label={link.label} />
      </Link>
    );
  });
}

export function AdminNav({
  newTickets = 0,
  newContacts = 0,
}: {
  newTickets?: number;
  newContacts?: number;
}) {
  const counts = { tickets: newTickets, contacts: newContacts };

  return (
    <header className="border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-6">
          <Link href="/admin" aria-label="Admin home" className="shrink-0">
            <Logo compact />
          </Link>
          <nav className="hidden items-center gap-3 xl:flex">
            <NavLinks counts={counts} variant="inline" />
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="whitespace-nowrap text-sm text-white/55 transition hover:text-white"
          >
            <span className="sm:hidden">Site</span>
            <span className="hidden sm:inline">View site</span>
          </Link>
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/15 px-2.5 py-1.5 text-sm text-white/80 transition hover:border-white/30 hover:text-white sm:px-3"
            >
              <LogOut className="size-4 shrink-0" />
              <span className="hidden min-[400px]:inline">Sign out</span>
            </button>
          </form>
        </div>
      </div>
      <nav className="mx-auto flex w-full max-w-6xl flex-wrap gap-1.5 px-4 pb-3 xl:hidden">
        <NavLinks counts={counts} variant="chips" />
      </nav>
    </header>
  );
}
