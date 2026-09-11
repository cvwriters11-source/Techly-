import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFeatureToggle } from "@/components/admin/marketing-feature-toggle";
import { formatDateTime } from "@/lib/inbox/format";
import {
  getLatestPostedAt,
  listMarketingProfiles,
  listMarketingSocials,
} from "@/lib/marketing/store";
import { isMarketingPublicEnabled } from "@/lib/site-settings/store";

export const metadata: Metadata = {
  title: "Marketing companies",
  robots: { index: false, follow: false },
};

export default async function AdminMarketingPage() {
  const [profiles, marketingPublicEnabled] = await Promise.all([
    listMarketingProfiles(),
    isMarketingPublicEnabled(),
  ]);

  const rows = await Promise.all(
    profiles.map(async (profile) => {
      const [socials, lastPostedAt] = await Promise.all([
        listMarketingSocials(profile.id),
        getLatestPostedAt(profile.id),
      ]);
      return {
        profile,
        connected: socials.filter((social) => social.connected).length,
        lastPostedAt,
      };
    }),
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          Business marketing
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Companies</h1>
        <p className="mt-2 text-sm text-white/55">
          Registered marketing accounts. Email verification unlocks the
          dashboard — no separate admin approval step.
        </p>
      </div>

      <MarketingFeatureToggle enabled={marketingPublicEnabled} />

      {rows.length === 0 ? (
        <p className="rounded-[1.4rem] border border-white/12 bg-[#0c0c0c] p-8 text-sm text-white/55">
          No marketing companies registered yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-[1.4rem] border border-white/12 bg-[#0c0c0c]">
          {rows.map(({ profile, connected, lastPostedAt }) => (
            <div
              key={profile.id}
              className="border-b border-white/8 px-4 py-4 last:border-b-0"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{profile.company}</p>
                  <p className="mt-0.5 text-xs text-white/45">
                    {profile.email}
                    {profile.phone ? ` · ${profile.phone}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-white/12 bg-white/5 px-2.5 py-0.5 text-white/75">
                    {profile.setupComplete ? "Setup done" : "Setup incomplete"}
                  </span>
                  <span
                    className={
                      profile.active
                        ? "rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-accent"
                        : "rounded-full border border-white/12 bg-white/5 px-2.5 py-0.5 text-white/55"
                    }
                  >
                    {profile.active ? "Auto-post on" : "Paused"}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-sm text-white/70">
                {profile.website || "No website yet"}
              </p>
              <p className="mt-2 text-xs text-white/45">
                {connected} connected social
                {connected === 1 ? "" : "s"} ·{" "}
                {profile.postsPerPeriod}/{profile.period} · Registered{" "}
                {formatDateTime(profile.createdAt)}
                {lastPostedAt
                  ? ` · Last posted ${formatDateTime(lastPostedAt)}`
                  : " · No posts yet"}
              </p>
            </div>
          ))}
        </div>
      )}

      <p className="text-sm text-white/45">
        Public signup lives at{" "}
        <Link href="/marketing" className="text-accent">
          /marketing
        </Link>
        {marketingPublicEnabled ? " (currently live)." : " (currently hidden)."}
      </p>
    </div>
  );
}
