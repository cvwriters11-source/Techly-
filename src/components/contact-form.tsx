"use client";

import { useActionState, useEffect, useState } from "react";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitContact, type ContactState } from "@/app/contact/actions";
import { cn } from "@/lib/utils";
import {
  budgetRanges,
  contactMethods,
  serviceOptions,
} from "@/lib/site";

const initial: ContactState = { ok: false, message: "" };

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-accent/50 focus:ring-2 focus:ring-accent/20";

const choiceClass =
  "flex cursor-pointer items-center gap-3 rounded-2xl border border-white/15 bg-[#111] px-4 py-3 text-sm text-white has-checked:border-accent has-checked:bg-accent/10";

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

function ChoiceGroup({
  legend,
  name,
  options,
  error,
  columns = "sm:grid-cols-2",
}: {
  legend: string;
  name: string;
  options: readonly string[];
  error?: string;
  columns?: string;
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-medium text-white">{legend}</legend>
      <div className={`grid gap-3 ${columns}`}>
        {options.map((option) => (
          <label key={option} className={choiceClass}>
            <input
              type="radio"
              name={name}
              value={option}
              required
              className="accent-[#12c8b0]"
            />
            {option}
          </label>
        ))}
      </div>
      {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}
    </fieldset>
  );
}

function FormDropdown({
  label,
  name,
  options,
  placeholder,
  defaultValue = "",
  startOpen = false,
  error,
}: {
  label: string;
  name: string;
  options: readonly string[];
  placeholder: string;
  defaultValue?: string;
  startOpen?: boolean;
  error?: string;
}) {
  const [open, setOpen] = useState(startOpen);
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (startOpen) setOpen(true);
  }, [startOpen]);

  return (
    <div>
      <input type="hidden" name={name} value={value} />
      <p className="mb-2 text-sm font-medium text-white">{label}</p>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={cn(
          inputClass,
          "flex items-center justify-between text-left",
          value ? "text-white" : "text-white/40",
        )}
      >
        <span>{value || placeholder}</span>
        <ChevronDown
          className={cn("size-4 shrink-0 text-white/55 transition", open && "rotate-180")}
        />
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label={label}
          className="mt-2 overflow-hidden rounded-2xl border border-white/15 bg-[#111]"
        >
          {options.map((option) => (
            <li key={option}>
              <button
                type="button"
                role="option"
                aria-selected={value === option}
                onClick={() => {
                  setValue(option);
                  setOpen(false);
                }}
                className={cn(
                  "w-full px-3.5 py-2.5 text-left text-sm text-white transition hover:bg-white/5",
                  value === option && "bg-accent/10 text-accent",
                )}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {error ? (
        <p className="mt-2 text-xs text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ContactForm({
  defaultService,
}: {
  defaultService?: string;
}) {
  const [state, action, pending] = useActionState(submitContact, initial);

  if (state.ok) {
    return (
      <div className="rounded-[1.8rem] border border-accent/25 bg-accent/10 p-8">
        <CheckCircle2 className="size-8 text-accent" />
        <h3 className="mt-4 text-2xl font-semibold text-white">
          Request received
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-white/75">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-8">
      {state.message ? (
        <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {state.message}
        </p>
      ) : null}

      <FormDropdown
        label="What do you need help with?"
        name="service"
        options={serviceOptions}
        placeholder="Select a service"
        defaultValue={defaultService}
        startOpen={Boolean(defaultService)}
        error={state.fieldErrors?.service}
      />

      <FormDropdown
        label="Budget range"
        name="budget"
        options={budgetRanges}
        placeholder="Select a budget range"
        error={state.fieldErrors?.budget}
      />

      <ChoiceGroup
        legend="Preferred contact method"
        name="contactMethod"
        options={contactMethods}
        error={state.fieldErrors?.contactMethod}
        columns="sm:grid-cols-3"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" error={state.fieldErrors?.name}>
          <input className={inputClass} name="name" autoComplete="name" required />
        </Field>
        <Field label="Company" error={state.fieldErrors?.company}>
          <input
            className={inputClass}
            name="company"
            autoComplete="organization"
            required
          />
        </Field>
        <Field label="Email" error={state.fieldErrors?.email}>
          <input
            className={inputClass}
            name="email"
            type="email"
            autoComplete="email"
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
      </div>

      <Field label="Tell us a bit more" error={state.fieldErrors?.description}>
        <textarea
          className={`${inputClass} min-h-32 resize-y`}
          name="description"
          required
          placeholder="What are you trying to build, fix or automate?"
        />
      </Field>

      <Button type="submit" variant="solid" disabled={pending}>
        {pending ? "Sending…" : "Request a Consultation"}
      </Button>
    </form>
  );
}
