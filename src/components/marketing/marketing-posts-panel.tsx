"use client";

import { useActionState } from "react";
import {
  cancelQueuedPost,
  regenerateMarketingQueue,
  updateQueuedPost,
  type MarketingFormState,
} from "@/app/marketing/actions";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/inbox/format";
import type { MarketingPost } from "@/lib/marketing/store";

const initial: MarketingFormState = { ok: false, message: "" };

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20";

function statusClass(status: MarketingPost["status"]) {
  if (status === "posted") return "border-accent/30 bg-accent/10 text-accent";
  if (status === "failed") return "border-red-400/30 bg-red-400/10 text-red-200";
  if (status === "cancelled") {
    return "border-white/15 bg-white/5 text-white/55";
  }
  return "border-amber-400/20 bg-amber-400/10 text-amber-100";
}

export function MarketingPostsPanel({ posts }: { posts: MarketingPost[] }) {
  const [editState, editAction, editPending] = useActionState(
    updateQueuedPost,
    initial,
  );
  const [regenState, regenAction, regenPending] = useActionState(
    regenerateMarketingQueue,
    initial,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Ad queue</h2>
          <p className="mt-1 text-sm text-white/55">
            AI writes sales ads around your company name and services. Edit
            queued posts before they go live.
          </p>
        </div>
        <form action={regenAction}>
          <Button type="submit" variant="ghost" disabled={regenPending}>
            {regenPending ? "Generating…" : "Generate more ads"}
          </Button>
        </form>
      </div>

      {regenState.message ? (
        <p
          role="status"
          className={
            regenState.ok
              ? "rounded-xl border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-accent"
              : "rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200"
          }
        >
          {regenState.message}
        </p>
      ) : null}

      {editState.message ? (
        <p
          role="status"
          className={
            editState.ok
              ? "rounded-xl border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-accent"
              : "rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200"
          }
        >
          {editState.message}
        </p>
      ) : null}

      {posts.length === 0 ? (
        <p className="rounded-[1.4rem] border border-white/12 bg-[#0c0c0c] p-6 text-sm text-white/55">
          No ads queued yet. Save your company setup to generate the first
          batch.
        </p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="rounded-[1.4rem] border border-white/12 bg-[#0c0c0c] p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusClass(post.status)}`}
                >
                  {post.status}
                </span>
                <span className="text-xs text-white/45">
                  {formatDateTime(post.scheduledFor)}
                </span>
              </div>

              {post.status === "queued" ? (
                <form action={editAction} className="mt-4 space-y-3">
                  <input type="hidden" name="postId" value={post.id} />
                  <textarea
                    className={`${inputClass} min-h-28`}
                    name="body"
                    defaultValue={post.body}
                    required
                  />
                  <div className="flex flex-wrap gap-3">
                    <Button type="submit" variant="solid" disabled={editPending}>
                      {editPending ? "Saving…" : "Save copy"}
                    </Button>
                    <button
                      formAction={cancelQueuedPost}
                      className="text-sm text-red-300 transition hover:text-red-200"
                    >
                      Cancel post
                    </button>
                  </div>
                </form>
              ) : (
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-white/80">
                  {post.body}
                </p>
              )}

              {post.error ? (
                <p className="mt-3 text-sm text-red-200">{post.error}</p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
