"use client";

import { useActionState, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitContact, type ContactState } from "@/app/contact/actions";
import { cn } from "@/lib/utils";
import {
  budgetRanges,
  cameraConnectivityOptions,
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
  onChange,
}: {
  label: string;
  name: string;
  options: readonly string[];
  placeholder: string;
  defaultValue?: string;
  startOpen?: boolean;
  error?: string;
  onChange?: (value: string) => void;
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
        onClick={() => setOpen((current) => !current)}
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
                  onChange?.(option);
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

function RequestReceivedPopup({
  open,
  message,
  onClose,
}: {
  open: boolean;
  message: string;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-received-title"
      onClick={onClose}
    >
      <div
        className="relative flex h-[min(680px,92dvh)] w-full max-w-[390px] flex-col overflow-hidden rounded-[2.4rem] border border-accent/50 bg-[#111] px-6 py-8 text-center shadow-[0_0_80px_rgba(18,200,176,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute left-1/2 top-[46%] size-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/25 blur-3xl" />
          <div className="absolute left-1/2 top-[46%] size-[21rem] -translate-x-1/2 -translate-y-1/2 animate-[spin_28s_linear_infinite_reverse] rounded-full border border-dashed border-accent/30" />
          <Image
            src="/techly-badge.png"
            alt=""
            width={400}
            height={400}
            className="absolute left-1/2 top-[46%] size-[19rem] max-w-none -translate-x-1/2 -translate-y-1/2 animate-[spin_18s_linear_infinite] rounded-full object-contain opacity-40 drop-shadow-[0_0_36px_rgba(18,200,176,0.45)]"
          />
        </div>
        <p className="relative z-10 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
          Contact
        </p>
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
          <CheckCircle2 className="size-14 text-accent drop-shadow-[0_0_18px_rgba(18,200,176,0.65)]" />
          <h2
            id="request-received-title"
            className="mt-6 text-4xl font-semibold leading-tight text-white"
          >
            Request received
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-white/90">{message}</p>
        </div>
        <Button type="button" variant="solid" className="relative z-10 w-full py-3" onClick={onClose}>
          OK
        </Button>
      </div>
    </div>,
    document.body,
  );
}

export function ContactForm({
  defaultService,
  defaultCamera,
}: {
  defaultService?: string;
  defaultCamera?: string;
}) {
  const [state, action, pending] = useActionState(submitContact, initial);
  const [popupOpen, setPopupOpen] = useState(false);
  const [service, setService] = useState(defaultService ?? "");
  const showConnectivity =
    Boolean(defaultCamera) || service === "CCTV Camera Installations";
  const cameraPrefill = defaultCamera
    ? `I want a quotation for ${defaultCamera}.\n\n`
    : "";

  useEffect(() => {
    if (state.ok) setPopupOpen(true);
  }, [state]);

  if (state.ok) {
    return (
      <>
        <RequestReceivedPopup
          open={popupOpen}
          message={state.message}
          onClose={() => setPopupOpen(false)}
        />
        {!popupOpen ? (
          <p className="text-sm leading-relaxed text-white/70">
            Request received. {state.message}
          </p>
        ) : null}
      </>
    );
  }

  return (
    <form action={action} className="space-y-8">
      {state.message ? (
        <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {state.message}
        </p>
      ) : null}

      {defaultCamera ? (
        <div className="rounded-2xl border border-accent/35 bg-accent/10 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
            Camera type
          </p>
          <p className="mt-1 text-sm font-medium text-white">{defaultCamera}</p>
          <input type="hidden" name="camera" value={defaultCamera} />
        </div>
      ) : null}

      <FormDropdown
        label="What do you need help with?"
        name="service"
        options={serviceOptions}
        placeholder="Select a service"
        defaultValue={defaultService}
        startOpen={Boolean(defaultService)}
        error={state.fieldErrors?.service}
        onChange={setService}
      />

      {showConnectivity ? (
        <ChoiceGroup
          legend="Do you want a Wi‑Fi camera or a SIM card camera?"
          name="cameraConnectivity"
          options={cameraConnectivityOptions}
          error={state.fieldErrors?.cameraConnectivity}
          columns="sm:grid-cols-2"
        />
      ) : null}

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
          defaultValue={cameraPrefill}
          placeholder="What are you trying to build, fix or automate?"
        />
      </Field>

      <Button type="submit" variant="solid" disabled={pending}>
        {pending ? "Sending…" : "Request a Consultation"}
      </Button>
    </form>
  );
}
