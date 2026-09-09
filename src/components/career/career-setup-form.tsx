"use client";

import { useActionState } from "react";
import {
  startCareerSessionAction,
  type CareerFormState,
} from "@/app/career/actions";
import { Button } from "@/components/ui/button";
import type {
  CareerDuration,
  CareerFocus,
  CareerProfile,
  CareerVoice,
} from "@/lib/career/store";

const initial: CareerFormState = { ok: false, message: "" };

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20";

const focuses: { value: CareerFocus; label: string; hint: string }[] = [
  {
    value: "interview",
    label: "Interview preparation",
    hint: "Top 20 general interview questions with natural sample-answer coaching",
  },
  {
    value: "job_hunt",
    label: "Job hunt techniques",
    hint: "Applications, outreach, and search strategy",
  },
  {
    value: "career_growth",
    label: "Career development",
    hint: "Growth conversations and long-term planning",
  },
];

const voices: { value: CareerVoice; label: string }[] = [
  { value: "woman", label: "Woman (en-ZA Leah)" },
  { value: "man", label: "Man (en-ZA Luke)" },
];

const durations: CareerDuration[] = [20, 30, 60];

export function CareerSetupForm({ profile }: { profile: CareerProfile }) {
  const [state, formAction, pending] = useActionState(
    startCareerSessionAction,
    initial,
  );

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-[1.4rem] border border-white/12 bg-[#0c0c0c] p-6"
    >
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

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white">
          Target role
        </span>
        <input
          className={inputClass}
          name="targetRole"
          defaultValue={profile.targetRole}
          placeholder="e.g. Junior software developer, Call centre agent…"
          required
        />
      </label>

      <fieldset>
        <legend className="mb-3 text-sm font-medium text-white">
          Session focus
        </legend>
        <div className="grid gap-3">
          {focuses.map((item) => (
            <label
              key={item.value}
              className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white has-checked:border-accent has-checked:bg-accent/10"
            >
              <input
                type="radio"
                name="focus"
                value={item.value}
                defaultChecked={profile.focus === item.value}
                required
                className="mt-1 accent-[#12c8b0]"
              />
              <span>
                <span className="font-medium">{item.label}</span>
                <span className="mt-0.5 block text-white/55">{item.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-medium text-white">
          Coach voice (African SA English)
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {voices.map((item) => (
            <label
              key={item.value}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white has-checked:border-accent has-checked:bg-accent/10"
            >
              <input
                type="radio"
                name="voice"
                value={item.value}
                defaultChecked={profile.preferredVoice === item.value}
                required
                className="accent-[#12c8b0]"
              />
              {item.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-medium text-white">
          Session length
        </legend>
        <div className="grid grid-cols-3 gap-3">
          {durations.map((minutes) => (
            <label
              key={minutes}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/15 bg-black/40 px-3 py-3 text-sm font-medium text-white has-checked:border-accent has-checked:bg-accent/10"
            >
              <input
                type="radio"
                name="duration"
                value={minutes}
                defaultChecked={profile.preferredDuration === minutes}
                required
                className="accent-[#12c8b0]"
              />
              {minutes} min
            </label>
          ))}
        </div>
      </fieldset>

      <Button type="submit" variant="solid" disabled={pending} className="w-full">
        {pending ? "Starting session…" : "Start timed session"}
      </Button>
    </form>
  );
}
