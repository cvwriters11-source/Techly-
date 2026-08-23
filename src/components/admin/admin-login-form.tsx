"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { loginAdmin, type AdminLoginState } from "@/app/admin/actions";

const initial: AdminLoginState = { ok: false, message: "" };

export function AdminLoginForm({ from }: { from: string }) {
  const [state, action, pending] = useActionState(loginAdmin, initial);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="from" value={from} />
      {state.message ? (
        <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {state.message}
        </p>
      ) : null}
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white">
          Admin password
        </span>
        <input
          className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
          type="password"
          name="password"
          autoComplete="current-password"
          required
        />
      </label>
      <Button type="submit" variant="solid" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
