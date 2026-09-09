"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/ui/password-field";
import {
  signInMarketing,
  signUpMarketing,
  type MarketingAuthState,
} from "@/app/marketing/actions";

const initial: MarketingAuthState = { ok: false, message: "" };

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20";

export function MarketingAuthForm({ mode }: { mode: "login" | "register" }) {
  const action = mode === "register" ? signUpMarketing : signInMarketing;
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-5">
      {state.message ? (
        <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {state.message}
        </p>
      ) : null}

      {mode === "register" ? (
        <>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-white">
              Your name
            </span>
            <input className={inputClass} name="name" autoComplete="name" required />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-white">
              Company name
            </span>
            <input
              className={inputClass}
              name="company"
              autoComplete="organization"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-white">
              Phone number
            </span>
            <input
              className={inputClass}
              name="phone"
              type="tel"
              autoComplete="tel"
              required
            />
          </label>
        </>
      ) : null}

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white">Email</span>
        <input
          className={inputClass}
          type="email"
          name="email"
          autoComplete="email"
          required
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white">Password</span>
        <PasswordField
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          minLength={8}
        />
      </label>

      <Button type="submit" variant="solid" disabled={pending} className="w-full">
        {pending
          ? mode === "register"
            ? "Creating account…"
            : "Signing in…"
          : mode === "register"
            ? "Register company"
            : "Log in"}
      </Button>

      <p className="text-center text-sm text-white/55">
        {mode === "register" ? (
          <>
            Already registered?{" "}
            <Link href="/marketing/login" className="text-accent">
              Log in
            </Link>
          </>
        ) : (
          <>
            New company?{" "}
            <Link href="/marketing/register" className="text-accent">
              Register
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
