"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { CheckCircle2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitTicket, type TicketState } from "@/app/ticket/actions";
import { cn } from "@/lib/utils";
import {
  contactMethods,
  ticketClientTypes,
  ticketProblemGroups,
  ticketUrgency,
} from "@/lib/site";

const initial: TicketState = { ok: false, message: "" };

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-accent/50 focus:ring-2 focus:ring-accent/20";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-white">{label}</span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-xs text-red-300" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function TicketForm({
  defaults,
}: {
  defaults?: {
    name?: string;
    company?: string;
    email?: string;
    clientType?: string;
  };
}) {
  const [state, action, pending] = useActionState(submitTicket, initial);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const filteredGroups = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return ticketProblemGroups;

    return ticketProblemGroups
      .map((group) => ({
        ...group,
        problems: group.problems.filter(
          (problem) =>
            problem.toLowerCase().includes(term) ||
            group.category.toLowerCase().includes(term),
        ),
      }))
      .filter((group) => group.problems.length > 0);
  }, [query]);

  function toggleProblem(problem: string) {
    setSelected((current) =>
      current.includes(problem)
        ? current.filter((item) => item !== problem)
        : [...current, problem],
    );
  }

  if (state.ok) {
    return (
      <div className="rounded-[1.8rem] border border-accent/25 bg-accent/10 p-8">
        <CheckCircle2 className="size-8 text-accent" />
        <h3 className="mt-4 text-2xl font-semibold text-white">Ticket logged</h3>
        <p className="mt-3 text-sm leading-relaxed text-white/75">{state.message}</p>
        {state.accountLink ? (
          <Link href="/account" className="mt-5 inline-block text-sm text-accent">
            View my tickets
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <form action={action} className="space-y-8">
      {selected.map((problem) => (
        <input key={problem} type="hidden" name="problems" value={problem} />
      ))}

      {state.message ? (
        <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {state.message}
        </p>
      ) : null}

      <fieldset>
        <legend className="mb-3 text-sm font-medium text-white">
          Are you a new or existing client?
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {ticketClientTypes.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/15 bg-[#111] px-4 py-3 text-sm text-white has-checked:border-accent has-checked:bg-accent/10"
            >
              <input
                type="radio"
                name="clientType"
                value={option}
                defaultChecked={defaults?.clientType === option}
                required
                className="accent-[#12c8b0]"
              />
              {option}
            </label>
          ))}
        </div>
        {state.fieldErrors?.clientType ? (
          <p className="mt-2 text-xs text-red-300">{state.fieldErrors.clientType}</p>
        ) : null}
      </fieldset>

      <div>
        <p className="text-sm font-medium text-white">
          What problem do you need help with?
        </p>
        <p className="mt-1 text-sm text-white/60">
          Search or scroll. Choose as many as apply — new clients can pick “I am
          not sure” if you need advice.
        </p>
        {state.fieldErrors?.problems ? (
          <p className="mt-2 text-xs text-red-300">{state.fieldErrors.problems}</p>
        ) : null}

        <div className="mt-4 flex h-72 flex-col overflow-hidden rounded-[1.6rem] border border-white/12 bg-[#111]">
          <div className="shrink-0 border-b border-white/10 p-3">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search a problem, e.g. email, website, CRM…"
                className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pr-3 pl-10 text-sm text-white outline-none placeholder:text-white/35 focus:border-accent/50"
              />
            </label>
            {selected.length > 0 ? (
              <p className="mt-2 text-xs text-accent">
                {selected.length} selected
              </p>
            ) : null}
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-scroll overscroll-contain p-3 [scrollbar-gutter:stable]">
            {filteredGroups.length === 0 ? (
              <p className="py-8 text-center text-sm text-white/55">
                No matching problems. Try another search, or choose “I am not
                sure what I need”.
              </p>
            ) : (
              filteredGroups.map((group) => (
                <section key={group.category}>
                  <div className="sticky top-0 z-10 -mx-3 mb-2 border-b border-white/8 bg-[#111] px-3 py-2">
                    <h3 className="text-sm font-semibold text-accent">
                      {group.category}
                    </h3>
                    <p className="mt-0.5 text-xs text-white/50">{group.intro}</p>
                  </div>
                  <div className="space-y-2">
                    {group.problems.map((problem) => {
                      const checked = selected.includes(problem);
                      return (
                        <label
                          key={problem}
                          className={cn(
                            "flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-sm leading-snug text-white/90 transition",
                            checked
                              ? "border-accent bg-accent/10"
                              : "border-white/10 hover:border-accent/40",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleProblem(problem)}
                            className="mt-0.5 shrink-0 accent-[#12c8b0]"
                          />
                          {problem}
                        </label>
                      );
                    })}
                  </div>
                </section>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" error={state.fieldErrors?.name}>
          <input
            className={inputClass}
            name="name"
            autoComplete="name"
            defaultValue={defaults?.name}
            required
          />
        </Field>
        <Field label="Company" error={state.fieldErrors?.company}>
          <input
            className={inputClass}
            name="company"
            autoComplete="organization"
            defaultValue={defaults?.company}
            required
          />
        </Field>
        <Field label="Email" error={state.fieldErrors?.email}>
          <input
            className={inputClass}
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={defaults?.email}
            readOnly={Boolean(defaults?.email)}
            required
          />
        </Field>
        <Field label="Phone / WhatsApp" error={state.fieldErrors?.phone}>
          <input
            className={inputClass}
            name="phone"
            type="tel"
            autoComplete="tel"
            required
          />
        </Field>
        <Field label="How urgent is this?" error={state.fieldErrors?.urgency}>
          <select className={inputClass} name="urgency" defaultValue="" required>
            <option value="" disabled>
              Select urgency
            </option>
            {ticketUrgency.map((option) => (
              <option key={option} value={option} className="bg-black">
                {option}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Preferred contact method"
          error={state.fieldErrors?.contactMethod}
        >
          <select
            className={inputClass}
            name="contactMethod"
            defaultValue=""
            required
          >
            <option value="" disabled>
              Choose one
            </option>
            {contactMethods.map((option) => (
              <option key={option} value={option} className="bg-black">
                {option}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Tell us a bit more" error={state.fieldErrors?.description}>
        <textarea
          className={cn(inputClass, "min-h-32 resize-y")}
          name="description"
          required
          placeholder="What happened, who is affected, and what you need us to do?"
        />
      </Field>

      <Button type="submit" variant="solid" disabled={pending}>
        {pending ? "Logging ticket…" : "Log a Ticket"}
      </Button>
    </form>
  );
}
