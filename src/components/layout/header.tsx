"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { cn } from "@/lib/utils";
import { nav } from "@/lib/site";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl">
      <Container className="flex h-[88px] items-center justify-between gap-3 sm:gap-5">
        <Link href="/" aria-label="Techly home" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-3 lg:flex lg:gap-7">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-[13px] font-medium transition sm:text-sm",
                  active ? "text-accent" : "text-white hover:text-accent",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden shrink-0 lg:block">
          <Button href="/ticket" className="pl-4 text-[13px] sm:pl-5 sm:text-sm">
            Log a Ticket
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-full border border-white/20 text-white lg:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </Container>

      {open ? (
        <div className="border-t border-white/10 bg-black lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm text-white hover:bg-white/5"
              >
                {item.label}
              </Link>
            ))}
            <Button href="/ticket" className="mt-3 self-start">
              Log a Ticket
            </Button>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
