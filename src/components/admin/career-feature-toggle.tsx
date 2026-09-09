"use client";

import { useActionState } from "react";
import {
  setCareerFeatureAction,
  type CareerFeatureState,
} from "@/app/admin/career/actions";
import { Button } from "@/components/ui/button";

const initial: CareerFeatureState = { ok: false, message: "" };

export function CareerFeatureToggle({ enabled }: { enabled: boolean }) {
  const [state, formAction, pending] = useActionState(
    setCareerFeatureAction,
    initial,
  );

  return (
    <form
      key={enabled ? "on" : "off"}
      action={formAction}
      className="space-y-4 rounded-[1.4rem] border border-white/12 bg-[#111] p-5"
    >
      <div>
        <h2 className="text-lg font-semibold text-white">Public switch</h2>
        <p className="mt-1 text-sm text-white/55">
          When off, the Career coach nav link is hidden and the public career
          pages redirect home. Existing candidates can still log in to their
          dashboard.
        </p>
      </div>

      {state.message ? (
        <p
          role="status"
          className={
            state.ok
              ? "rounded-xl border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-accent"
              : "rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100"
          }
        >
          {state.message}
        </p>
      ) : null}

      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/15 bg-[#0c0c0c] px-4 py-3 text-sm text-white has-checked:border-accent has-checked:bg-accent/10">
        <input
          type="checkbox"
          name="enabled"
          defaultChecked={enabled}
          className="size-4 accent-[#12c8b0]"
        />
        Show Career coach on the website
      </label>

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Saving…" : "Save visibility"}
      </Button>
    </form>
  );
}
