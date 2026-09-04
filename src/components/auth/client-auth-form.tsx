"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/ui/password-field";
import {
  signInClient,
  signUpClient,
  type AuthFormState,
} from "@/app/auth/actions";

const initial: AuthFormState = { ok: false, message: "" };

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20";

export function ClientAuthForm({
  mode,
  from,
}: {
  mode: "login" | "signup";
  from: string;
}) {
  const action = mode === "signup" ? signUpClient : signInClient;
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="from" value={from} />
      {state.message ? (
        <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {state.message}
        </p>
      ) : null}
      {mode === "signup" ? (
        <>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-white">Name</span>
            <input className={inputClass} name="name" autoComplete="name" required />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-white">
              Company
            </span>
            <input
              className={inputClass}
              name="company"
              autoComplete="organization"
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
        <span className="mb-2 block text-sm font-medium text-white">
          Password
        </span>
        <PasswordField
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          minLength={8}
        />
      </label>
      <Button type="submit" variant="solid" disabled={pending} className="w-full">
        {pending
          ? mode === "signup"
            ? "Creating account…"
            : "Signing in…"
          : mode === "signup"
            ? "Create account"
            : "Log in"}
      </Button>
      <p className="text-center text-sm text-white/55">
        {mode === "signup" ? (
          <>
            Already a client?{" "}
            <Link href={`/login?from=${encodeURIComponent(from)}`} className="text-accent">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href={`/signup?from=${encodeURIComponent(from)}`} className="text-accent">
              Sign up
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
