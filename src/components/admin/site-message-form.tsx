"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { SiteMessageFormState } from "@/app/admin/messages/actions";
import type { SiteMessage } from "@/lib/site-messages/store";

const initial: SiteMessageFormState = { ok: false, message: "" };

const fieldClass =
  "w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-accent/50";

export function SiteMessageForm({
  action,
  message,
  submitLabel,
}: {
  action: (
    prev: SiteMessageFormState,
    formData: FormData,
  ) => Promise<SiteMessageFormState>;
  message?: SiteMessage;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-[1.4rem] border border-white/12 bg-[#111] p-5"
    >
      {message ? <input type="hidden" name="recordId" value={message.id} /> : null}
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
      <fieldset>
        <legend className="mb-3 text-sm font-medium text-white">Type</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["promotion", "Promotion"],
              ["warning", "Warning"],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-3 rounded-[1.4rem] border border-white/12 bg-[#0c0c0c] px-4 py-3 text-sm text-white has-checked:border-accent has-checked:bg-accent/10"
            >
              <input
                type="radio"
                name="kind"
                value={value}
                defaultChecked={(message?.kind ?? "promotion") === value}
                required
                className="accent-[#12c8b0]"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white">Headline</span>
        <input
          name="title"
          defaultValue={message?.title}
          required
          placeholder="Winter hosting special, scheduled maintenance…"
          className={fieldClass}
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white">
          Message
        </span>
        <textarea
          name="body"
          defaultValue={message?.body}
          required
          rows={4}
          placeholder="What clients should know, and why they should request a quotation."
          className={`${fieldClass} resize-y`}
        />
      </label>
      <label className="flex items-center gap-3 text-sm text-white">
        <input
          type="checkbox"
          name="active"
          defaultChecked={message?.active ?? true}
          className="size-4 accent-[#12c8b0]"
        />
        Show this message on the public site
      </label>
      <label className="block max-w-[12rem]">
        <span className="mb-2 block text-sm font-medium text-white">
          Display order
        </span>
        <input
          name="sortOrder"
          type="number"
          defaultValue={message?.sortOrder ?? 0}
          className={fieldClass}
        />
      </label>
      <p className="text-xs leading-relaxed text-white/45">
        The popup always includes a Get your quotation now button to Contact us.
        Active warnings are shown before promotions.
      </p>
      <Button type="submit" variant="solid" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
