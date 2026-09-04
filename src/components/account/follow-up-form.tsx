"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  submitClientFollowUp,
  type AuthFormState,
} from "@/app/auth/actions";

const initial: AuthFormState = { ok: false, message: "" };

export function FollowUpForm({ ticketId }: { ticketId: string }) {
  const [state, action, pending] = useActionState(submitClientFollowUp, initial);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="ticketId" value={ticketId} />
      {state.message ? (
        <p
          className={
            state.ok
              ? "rounded-xl border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-white"
              : "rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200"
          }
        >
          {state.message}
        </p>
      ) : null}
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white">
          Follow up
        </span>
        <textarea
          name="message"
          required
          minLength={8}
          placeholder="What has changed, or what do you need next?"
          className="min-h-28 w-full resize-y rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/40 focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
        />
      </label>
      <Button type="submit" variant="solid" disabled={pending}>
        {pending ? "Sending…" : "Send follow-up"}
      </Button>
    </form>
  );
}
