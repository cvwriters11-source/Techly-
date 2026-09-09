import type { Metadata } from "next";
import Link from "next/link";
import { CareerFeatureToggle } from "@/components/admin/career-feature-toggle";
import { formatDateTime } from "@/lib/inbox/format";
import {
  countCareerSessionsForProfile,
  focusLabel,
  listCareerProfiles,
  listCareerSessionsWithProfiles,
} from "@/lib/career/store";
import { isCareerPublicEnabled } from "@/lib/site-settings/store";
import { parseCareerReview } from "@/lib/career/interview-prep";

export const metadata: Metadata = {
  title: "Career coach",
  robots: { index: false, follow: false },
};

export default async function AdminCareerPage() {
  const [profiles, careerPublicEnabled, sessionRows] = await Promise.all([
    listCareerProfiles(),
    isCareerPublicEnabled(),
    listCareerSessionsWithProfiles(40),
  ]);

  const rows = await Promise.all(
    profiles.map(async (profile) => ({
      profile,
      sessions: await countCareerSessionsForProfile(profile.id),
    })),
  );

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          Career coach
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">
          Conversations
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Every coach and candidate exchange is saved here so you can read and
          listen to the session.
        </p>
      </div>

      <CareerFeatureToggle enabled={careerPublicEnabled} />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Recent sessions</h2>
        {sessionRows.length === 0 ? (
          <p className="rounded-[1.4rem] border border-white/12 bg-[#0c0c0c] p-8 text-sm text-white/55">
            No interview sessions yet.
          </p>
        ) : (
          <div className="overflow-hidden rounded-[1.4rem] border border-white/12 bg-[#0c0c0c]">
            {sessionRows.map(({ session, profile }) => {
              const review = parseCareerReview(session.summary);
              return (
                <Link
                  key={session.id}
                  href={`/admin/career/sessions/${session.id}`}
                  className="block border-b border-white/8 px-4 py-4 transition last:border-b-0 hover:bg-white/[0.03]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">
                        {profile?.name || "Candidate"}
                      </p>
                      <p className="mt-0.5 text-xs text-white/45">
                        {profile?.email || "No email"} · {session.id}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/12 bg-white/5 px-2.5 py-0.5 text-xs capitalize text-white/75">
                      {session.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-white/70">
                    {session.targetRole || "No target role"} ·{" "}
                    {focusLabel(session.focus)} · {session.voice} ·{" "}
                    {session.durationMinutes} min
                    {review ? ` · Score ${review.score}/100` : ""}
                  </p>
                  <p className="mt-2 text-xs text-white/45">
                    {formatDateTime(session.createdAt)} · Open transcript &
                    listen
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Candidates</h2>
        {rows.length === 0 ? (
          <p className="rounded-[1.4rem] border border-white/12 bg-[#0c0c0c] p-8 text-sm text-white/55">
            No career candidates registered yet.
          </p>
        ) : (
          <div className="overflow-hidden rounded-[1.4rem] border border-white/12 bg-[#0c0c0c]">
            {rows.map(({ profile, sessions }) => (
              <div
                key={profile.id}
                className="border-b border-white/8 px-4 py-4 last:border-b-0"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{profile.name}</p>
                    <p className="mt-0.5 text-xs text-white/45">
                      {profile.email}
                      {profile.phone ? ` · ${profile.phone}` : ""}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/12 bg-white/5 px-2.5 py-0.5 text-xs text-white/75">
                    {sessions} session{sessions === 1 ? "" : "s"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-white/70">
                  {profile.targetRole || "No target role yet"} ·{" "}
                  {focusLabel(profile.focus)} · {profile.preferredVoice} voice ·{" "}
                  {profile.preferredDuration} min
                </p>
                <p className="mt-2 text-xs text-white/45">
                  Registered {formatDateTime(profile.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="text-sm text-white/45">
        Public signup lives at{" "}
        <Link href="/career" className="text-accent">
          /career
        </Link>
        {careerPublicEnabled ? " (currently live)." : " (currently hidden)."}
      </p>
    </div>
  );
}
