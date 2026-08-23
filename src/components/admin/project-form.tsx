"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { ProjectFormState } from "@/app/admin/projects/actions";
import type { ProjectRecord } from "@/lib/projects/store";

const initial: ProjectFormState = { ok: false, message: "" };

const fieldClass =
  "w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-accent/50";

export function ProjectForm({
  action,
  project,
  submitLabel,
}: {
  action: (
    prev: ProjectFormState,
    formData: FormData,
  ) => Promise<ProjectFormState>;
  project?: ProjectRecord;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-[1.4rem] border border-white/12 bg-[#111] p-5"
    >
      {project ? <input type="hidden" name="recordId" value={project.id} /> : null}
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
          Project name
        </span>
        <input
          name="title"
          defaultValue={project?.title}
          required
          placeholder="Client portal, booking app…"
          className={fieldClass}
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white">
          Live site link
        </span>
        <input
          name="url"
          defaultValue={project?.url}
          required
          inputMode="url"
          placeholder="https://example.co.za"
          className={fieldClass}
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white">
          Short description
        </span>
        <textarea
          name="summary"
          defaultValue={project?.summary}
          rows={3}
          placeholder="What you built for this client…"
          className={`${fieldClass} resize-y`}
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white">
          Image link (optional)
        </span>
        <input
          name="imageUrl"
          defaultValue={project?.imageUrl}
          inputMode="url"
          placeholder="https://…"
          className={fieldClass}
        />
      </label>
      <label className="block max-w-[12rem]">
        <span className="mb-2 block text-sm font-medium text-white">
          Display order
        </span>
        <input
          name="sortOrder"
          type="number"
          defaultValue={project?.sortOrder ?? 0}
          className={fieldClass}
        />
      </label>
      <Button type="submit" variant="solid" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
