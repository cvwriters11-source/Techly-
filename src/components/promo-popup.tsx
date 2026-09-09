"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { BrandSpinBackdrop } from "@/components/brand-spin-backdrop";
import { Button } from "@/components/ui/button";
import type { SiteMessage } from "@/lib/site-messages/store";

export const PROMO_FIRST_DELAY_MS = 2 * 60 * 1000;
export const PROMO_REPEAT_DELAY_MS = 4 * 60 * 1000;

const servicePills = [
  "Software Development",
  "IT Support",
  "Business Automation",
  "CCTV Installations",
];

function shouldHidePopup(pathname: string) {
  return (
    pathname.startsWith("/admin") ||
    pathname === "/contact" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/marketing")
  );
}

export function PromoPopup({ message }: { message: SiteMessage }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const hidden = shouldHidePopup(pathname);
  const warning = message.kind === "warning";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (hidden) {
      setOpen(false);
      return;
    }

    const preview =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).has("promoPreview");
    const firstDelay = preview ? 400 : PROMO_FIRST_DELAY_MS;
    const secondDelay = preview ? 800 : PROMO_REPEAT_DELAY_MS;

    setOpen(false);
    const first = window.setTimeout(() => setOpen(true), firstDelay);
    const second = window.setTimeout(
      () => setOpen(true),
      firstDelay + secondDelay,
    );
    return () => {
      window.clearTimeout(first);
      window.clearTimeout(second);
    };
  }, [pathname, hidden]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!mounted || hidden || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-popup-title"
      data-promo-first-ms={PROMO_FIRST_DELAY_MS}
      data-promo-repeat-ms={PROMO_REPEAT_DELAY_MS}
      onClick={() => setOpen(false)}
    >
      <div
        className={
          warning
            ? "relative flex h-[min(680px,92dvh)] w-full max-w-[390px] flex-col overflow-hidden rounded-[2.4rem] border border-amber-300/50 bg-[#111] px-6 py-8 text-center shadow-[0_0_80px_rgba(251,191,36,0.16)]"
            : "relative flex h-[min(680px,92dvh)] w-full max-w-[390px] flex-col overflow-hidden rounded-[2.4rem] border border-accent/50 bg-[#111] px-6 py-8 text-center shadow-[0_0_80px_rgba(18,200,176,0.18)]"
        }
        onClick={(event) => event.stopPropagation()}
      >
        <BrandSpinBackdrop tone={warning ? "warning" : "accent"} />
        <p
          className={
            warning
              ? "relative z-10 text-xs font-semibold uppercase tracking-[0.28em] text-amber-200"
              : "relative z-10 text-xs font-semibold uppercase tracking-[0.28em] text-accent"
          }
        >
          {warning ? "Notice" : "Techly"}
        </p>
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
          {warning ? (
            <AlertTriangle className="size-12 text-amber-300 drop-shadow-[0_0_18px_rgba(251,191,36,0.55)]" />
          ) : null}
          <h2
            id="promo-popup-title"
            className="mt-5 text-3xl font-semibold leading-tight text-white"
          >
            {message.title}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/90">
            {message.body}
          </p>
          {warning ? null : (
            <ul className="mt-6 flex flex-wrap justify-center gap-2">
              {servicePills.map((service) => (
                <li
                  key={service}
                  className="rounded-full border border-accent/25 bg-black/30 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-accent"
                >
                  {service}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="relative z-10 space-y-3">
          <Button
            href="/contact#consult"
            variant="solid"
            className="w-full py-3 uppercase"
          >
            Get your quotation Now
          </Button>
          <button
            type="button"
            className="w-full text-sm text-white/55 transition hover:text-white"
            onClick={() => setOpen(false)}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
