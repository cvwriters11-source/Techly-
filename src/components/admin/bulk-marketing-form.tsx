"use client";

import { useState } from "react";
import type { MarketingTemplateId } from "@/lib/inbox/marketing-templates";
import { marketingTemplates } from "@/lib/inbox/marketing-templates";

export function BulkMarketingForm({
  action,
  audience,
  recipientCount,
}: {
  action: (formData: FormData) => void | Promise<void>;
  audience: string;
  recipientCount: number;
}) {
  const [templateId, setTemplateId] = useState<MarketingTemplateId>(
    marketingTemplates[0].id,
  );
  const selected =
    marketingTemplates.find((template) => template.id === templateId) ??
    marketingTemplates[0];

  return (
    <form
      action={action}
      className="space-y-5 rounded-[1.4rem] border border-white/12 bg-[#0c0c0c] p-5 sm:p-6"
      onSubmit={(event) => {
        if (recipientCount === 0) {
          event.preventDefault();
          window.alert("There are no Contact us email addresses yet.");
          return;
        }
        const ok = window.confirm(
          `Send “${selected.label}” to all ${recipientCount} Contact us email${recipientCount === 1 ? "" : "s"}? This cannot be undone.`,
        );
        if (!ok) event.preventDefault();
      }}
    >
      <input type="hidden" name="audience" value={audience} />
      <input type="hidden" name="templateId" value={templateId} />

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
          Marketing message
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {marketingTemplates.map((template) => {
            const active = template.id === templateId;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => setTemplateId(template.id)}
                className={
                  active
                    ? "rounded-xl border border-accent/50 bg-accent/10 px-4 py-3 text-left"
                    : "rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-left hover:border-white/30"
                }
              >
                <span
                  className={
                    active
                      ? "text-sm font-semibold text-accent"
                      : "text-sm font-semibold text-white"
                  }
                >
                  {template.label}
                </span>
                <span className="mt-1 block text-xs text-white/55">
                  {template.subject}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-white/12 bg-black/40 px-4 py-3">
        <p className="text-sm font-semibold text-white">{selected.heading}</p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/70">
          {selected.body}
        </p>
      </div>

      <p className="text-xs text-white/45">
        Sends to every unique email on Contact us (all statuses), not only the
        audience list below.
      </p>

      <button
        type="submit"
        disabled={recipientCount === 0}
        className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
      >
        Send to all Contact us ({recipientCount})
      </button>
    </form>
  );
}
