import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminCareerAudioButton } from "@/components/admin/admin-career-audio-button";
import { formatDateTime } from "@/lib/inbox/format";
import { parseCareerReview } from "@/lib/career/interview-prep";
import {
  focusLabel,
  getCareerProfile,
  getCareerSession,
  listCareerMessages,
} from "@/lib/career/store";

export const metadata: Metadata = {
  title: "Career session",
  robots: { index: false, follow: false },
};

export default async function AdminCareerSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getCareerSession(id);
  if (!session) notFound();

  const [profile, messages] = await Promise.all([
    getCareerProfile(session.profileId),
    listCareerMessages(session.id),
  ]);
  const review = parseCareerReview(session.summary);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/career" className="text-sm text-accent hover:underline">
          ← Career coach
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          {profile?.name || "Candidate"} session
        </h1>
        <p className="mt-2 text-sm text-white/60">
          {profile?.email || "No email"} · {session.targetRole || "No role"} ·{" "}
          {focusLabel(session.focus)} · {session.voice} · {session.durationMinutes}{" "}
          min · {session.status}
        </p>
        <p className="mt-1 text-xs text-white/45">
          {formatDateTime(session.createdAt)} · {session.id}
        </p>
      </div>

      {review ? (
        <div className="rounded-[1.4rem] border border-white/12 bg-[#111] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            Score
          </p>
          <p className="mt-2 text-4xl font-semibold text-white">
            {review.score}
            <span className="text-lg text-white/45">/100</span>
          </p>
          <p className="mt-2 text-sm text-white/70">{review.overview}</p>
        </div>
      ) : session.summary ? (
        <div className="rounded-[1.4rem] border border-white/12 bg-[#111] p-5">
          <h2 className="text-lg font-semibold text-white">Summary</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-white/70">
            {session.summary}
          </p>
        </div>
      ) : null}

      <div className="rounded-[1.4rem] border border-white/12 bg-[#0c0c0c] p-5">
        <h2 className="text-lg font-semibold text-white">Full conversation</h2>
        <p className="mt-1 text-sm text-white/50">
          Read every line and press Listen to hear coach or candidate audio.
        </p>
        <div className="mt-5 space-y-4">
          {messages.length === 0 ? (
            <p className="text-sm text-white/45">No messages in this session.</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === "coach"
                    ? "rounded-2xl border border-accent/20 bg-accent/10 px-4 py-3"
                    : "rounded-2xl border border-white/12 bg-white/5 px-4 py-3"
                }
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-white/45">
                    {message.role === "coach" ? "Coach" : "Candidate"}
                  </p>
                  <p className="text-[11px] text-white/35">
                    {formatDateTime(message.createdAt)}
                  </p>
                </div>
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-white">
                  {message.text}
                </p>
                <AdminCareerAudioButton message={message} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
