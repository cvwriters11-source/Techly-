"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { Container } from "@/components/ui/section";
import { cn } from "@/lib/utils";
import { nav } from "@/lib/site";
import { signOutClient } from "@/app/auth/actions";

function AuthLink({
  href,
  children,
  accent = false,
}: {
  href: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "whitespace-nowrap rounded-full border px-2.5 py-1.5 text-[13px] font-medium transition md:px-3.5 md:text-sm",
        accent
          ? "border-accent bg-accent text-black"
          : "border-white/20 bg-white/5 text-white hover:border-accent/70 hover:bg-white/10",
      )}
    >
      {children}
    </Link>
  );
}

export function Header({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-black/70 py-3 backdrop-blur-xl">
      <Container className="flex h-[88px] items-center gap-3 rounded-2xl border border-white/20 bg-black/90 px-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_1px_0_0_rgba(18,200,176,0.45)] sm:gap-4 sm:px-4">
        <Link
          href="/"
          aria-label="Techly home"
          className="shrink-0"
          onClick={() => setOpen(false)}
        >
          <Logo />
        </Link>

        <nav className="hidden min-w-0 items-center gap-1 sm:flex md:gap-2">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const compact = item.label === "Approach" || item.label === "Our Profile";

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-full border px-2 py-1.5 text-xs font-medium transition md:px-3.5 md:text-sm",
                  compact && "hidden xl:inline-flex",
                  active
                    ? "border-accent bg-accent text-black"
                    : "border-white/20 bg-white/5 text-white hover:border-accent/70 hover:bg-white/10",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden shrink-0 items-center gap-1.5 sm:flex">
          {signedIn ? (
            <>
              <AuthLink href="/account">My tickets</AuthLink>
              <AuthLink href="/ticket" accent>
                Log a ticket
              </AuthLink>
            </>
          ) : (
            <>
              <AuthLink href="/login">Log in</AuthLink>
              <AuthLink href="/signup" accent>
                Sign up
              </AuthLink>
            </>
          )}
        </div>

        <button
          type="button"
          className="ml-auto inline-flex size-10 items-center justify-center rounded-full border border-white/20 text-white sm:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </Container>

      {open ? (
        <div className="border-t border-white/10 bg-black sm:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:border-accent/70 hover:bg-white/10"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              {signedIn ? (
                <>
                  <Link
                    href="/account"
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:border-accent/70 hover:bg-white/10"
                  >
                    My tickets
                  </Link>
                  <Link
                    href="/ticket"
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-accent bg-accent px-4 py-2.5 text-sm font-medium text-black"
                  >
                    Log a ticket
                  </Link>
                  <form action={signOutClient}>
                    <button
                      type="submit"
                      className="w-full rounded-full border border-white/20 bg-white/5 px-4 py-2.5 text-left text-sm font-medium text-white hover:border-accent/70 hover:bg-white/10"
                    >
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:border-accent/70 hover:bg-white/10"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-accent bg-accent px-4 py-2.5 text-sm font-medium text-black"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
