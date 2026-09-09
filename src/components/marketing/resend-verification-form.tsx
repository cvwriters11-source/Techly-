"use client";

import { useActionState } from "react";
import {
  resendMarketingVerification,
  type MarketingAuthState,
} from "@/app/marketing/actions";
import { Button } from "@/components/ui/button";

const initial: MarketingAuthState = { ok: false, message: "" };

export function ResendVerificationForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(
    resendMarketingVerification,
    initial,
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.message ? (
        <p
          role="status"
          className={
            state.ok
              ? "rounded-xl border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-accent"
              : "rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200"
          }
        >
          {state.message}
        </p>
      ) : (
        <p className="text-sm text-white/60">
          We sent a verification link to <span className="text-white">{email}</span>.
          Open it to unlock your marketing dashboard.
        </p>
      )}
      <Button type="submit" variant="solid" disabled={pending}>
        {pending ? "Sending…" : "Resend verification email"}
      </Button>
    </form>
  );
}
