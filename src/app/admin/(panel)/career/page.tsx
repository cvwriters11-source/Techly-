import type { Metadata } from "next";
import Link from "next/link";
import { CareerFeatureToggle } from "@/components/admin/career-feature-toggle";
import { formatDateTime } from "@/lib/inbox/format";
import {
  countCareerSessionsForProfile,
  focusLabel,
  listCareerProfiles,
} from "@/lib/career/store";
import { isCareerPublicEnabled } from "@/lib/site-settings/store";

export const metadata: Metadata = {
  title: "Career coach",
  robots: { index: false, follow: false },
};

export default async function AdminCareerPage() {
  const [profiles, careerPublicEnabled] = await Promise.all([
    listCareerProfiles(),
    isCareerPublicEnabled(),
  ]);

  const rows = await Promise.all(
    profiles.map(async (profile) => ({
      profile,
      sessions: await countCareerSessionsForProfile(profile.id),
    })),
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          Career coach
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Candidates</h1>
        <p className="mt-2 text-sm text-white/60">
          Registered job seekers for timed African-voice mock interviews.
        </p>
      </div>

      <CareerFeatureToggle enabled={careerPublicEnabled} />

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
