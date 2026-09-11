"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BrandSpinBackdrop } from "@/components/brand-spin-backdrop";
import { Button } from "@/components/ui/button";

export function AdminEmailSentPopup({
  open,
  title = "Email sent",
  message,
  onClose,
}: {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-email-sent-title"
      onClick={onClose}
    >
      <div
        className="relative flex h-[min(680px,92dvh)] w-full max-w-[390px] flex-col overflow-hidden rounded-[2.4rem] border border-accent/50 bg-[#111] px-6 py-8 text-center shadow-[0_0_80px_rgba(18,200,176,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <BrandSpinBackdrop />
        <p className="relative z-10 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
          Sent
        </p>
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
          <h2
            id="admin-email-sent-title"
            className="text-5xl font-semibold leading-tight text-white"
          >
            {title}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-white/75">{message}</p>
        </div>
        <Button
          type="button"
          variant="solid"
          className="relative z-10 w-full py-3"
          onClick={onClose}
        >
          OK
        </Button>
      </div>
    </div>,
    document.body,
  );
}

export function MarketingBlastPopup({
  blast,
  sent,
  failed,
  audience,
}: {
  blast?: string;
  sent?: string;
  failed?: string;
  audience: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("Email sent");

  useEffect(() => {
    if (!blast) {
      setOpen(false);
      return;
    }

    if (blast === "1") {
      const sentCount = Number(sent ?? "0");
      const failedCount = Number(failed ?? "0");
      setTitle("Email sent");
      setMessage(
        `Marketing email sent to ${sentCount} address${sentCount === 1 ? "" : "es"}${
          failedCount > 0 ? ` (${failedCount} failed)` : ""
        }.`,
      );
      setOpen(true);
      return;
    }

    if (blast === "failed") {
      setTitle("Not sent");
      setMessage(
        "No marketing emails could be sent. Check SMTP or Resend settings.",
      );
      setOpen(true);
      return;
    }

    if (blast === "empty") {
      setTitle("No emails");
      setMessage("No email addresses on Contact us yet.");
      setOpen(true);
      return;
    }

    if (blast === "invalid") {
      setTitle("Choose a message");
      setMessage("Choose a valid marketing message before sending.");
      setOpen(true);
    }
  }, [blast, sent, failed]);

  function clearBlastParams() {
    setOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("blast");
    params.delete("sent");
    params.delete("failed");
    params.set("view", "marketing");
    params.set("audience", audience);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <AdminEmailSentPopup
      open={open}
      title={title}
      message={message}
      onClose={clearBlastParams}
    />
  );
}
