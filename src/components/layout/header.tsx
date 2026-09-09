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
        "whitespace-nowrap rounded-full border px-2.5 py-1.5 text-xs font-medium transition xl:px-3 xl:text-sm",
        accent
          ? "border-accent bg-accent text-black"
          : "border-white/20 bg-white/5 text-white hover:border-accent/70 hover:bg-white/10",
      )}
    >
      {children}
    </Link>
  );
}

function navLabel(href: string, label: string, compact: boolean) {
  if (!compact) return label;
  if (href === "/marketing") return "Marketing";
  if (href === "/career") return "Career";
  return label;
}

export function Header({
  signedIn,
  authMode = null,
  marketingPublicEnabled = true,
  careerPublicEnabled = true,
}: {
  signedIn: boolean;
  authMode?: "client" | "marketing" | "career" | null;
  marketingPublicEnabled?: boolean;
  careerPublicEnabled?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const dashboardHref =
    authMode === "marketing"
      ? "/marketing/app"
      : authMode === "career"
        ? "/career/app"
        : "/account";
  const dashboardLabel =
    authMode === "marketing" || authMode === "career"
      ? "Dashboard"
      : "My tickets";
  const secondaryHref =
    authMode === "marketing"
      ? "/marketing"
      : authMode === "career"
        ? "/career"
        : "/ticket";
  const secondaryLabel =
    authMode === "marketing" || authMode === "career" ? "Home" : "Log a ticket";

  const items = nav.filter((item) => {
    if (!marketingPublicEnabled && item.href === "/marketing") return false;
    if (!careerPublicEnabled && item.href === "/career") return false;
    return true;
  });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-black/70 py-3 backdrop-blur-xl">
      <Container className="flex h-[72px] items-center gap-2 rounded-2xl border border-white/20 bg-black/90 px-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_1px_0_0_rgba(18,200,176,0.45)] sm:h-[80px] sm:gap-3 sm:px-4 lg:h-[88px]">
        <Link
          href="/"
          aria-label="Techly home"
          className="shrink-0"
          onClick={() => setOpen(false)}
        >
          <Logo compact />
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex xl:gap-1.5">
          {items.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const secondary =
              item.label === "Approach" || item.label === "Our Profile";

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-full border px-2 py-1.5 text-xs font-medium transition xl:px-3 xl:text-sm",
                  secondary && "hidden 2xl:inline-flex",
                  active
                    ? "border-accent bg-accent text-black"
                    : "border-white/20 bg-white/5 text-white hover:border-accent/70 hover:bg-white/10",
                )}
              >
                {navLabel(item.href, item.label, true)}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden shrink-0 items-center gap-1.5 lg:flex">
          {signedIn ? (
            <>
              <AuthLink href={dashboardHref}>{dashboardLabel}</AuthLink>
              <AuthLink href={secondaryHref} accent>
                {secondaryLabel}
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
          className="ml-auto inline-flex size-10 items-center justify-center rounded-full border border-white/20 text-white lg:hidden"
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
            {items.map((item) => (
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
                    href={dashboardHref}
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:border-accent/70 hover:bg-white/10"
                  >
                    {authMode === "marketing"
                      ? "Marketing dashboard"
                      : authMode === "career"
                        ? "Career dashboard"
                        : dashboardLabel}
                  </Link>
                  <Link
                    href={secondaryHref}
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-accent bg-accent px-4 py-2.5 text-sm font-medium text-black"
                  >
                    {authMode === "marketing"
                      ? "Marketing home"
                      : authMode === "career"
                        ? "Career home"
                        : secondaryLabel}
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
