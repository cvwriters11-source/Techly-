"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function PasswordField({
  autoComplete = "current-password",
  minLength,
  className,
}: {
  autoComplete?: string;
  minLength?: number;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        className={cn(
          "w-full rounded-xl border border-white/15 bg-white/[0.04] py-2.5 pr-11 pl-3.5 text-sm text-white outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20",
          className,
        )}
        type={visible ? "text" : "password"}
        name="password"
        autoComplete={autoComplete}
        required
        minLength={minLength}
      />
      <button
        type="button"
        className="absolute top-1/2 right-2.5 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/50 transition hover:text-white"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        onClick={() => setVisible((value) => !value)}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}
