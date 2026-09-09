"use client";

import { useActionState } from "react";
import {
  connectMarketingSocial,
  saveMarketingSetup,
  type MarketingFormState,
} from "@/app/marketing/actions";
import { Button } from "@/components/ui/button";
import {
  marketingPlatforms,
  platformLabel,
  type MarketingPlatform,
  type MarketingProfile,
  type MarketingSocial,
} from "@/lib/marketing/store";

const initial: MarketingFormState = { ok: false, message: "" };

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20";

export function MarketingSetupForm({
  profile,
  socials,
  publisherConfigured,
}: {
  profile: MarketingProfile;
  socials: MarketingSocial[];
  publisherConfigured: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveMarketingSetup, initial);
  const byPlatform = Object.fromEntries(
    socials.map((social) => [social.platform, social]),
  ) as Partial<Record<MarketingPlatform, MarketingSocial>>;

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-6">
        {state.message ? (
          <p
            role="status"
            className={
              state.ok
                ? "rounded-xl border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-accent"
                : "rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200"
            }
          >
            {state.message}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-medium text-white">
              Company name
            </span>
            <input
              className={inputClass}
              name="company"
              defaultValue={profile.company}
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-white">
              Contact name
            </span>
            <input
              className={inputClass}
              name="contactName"
              defaultValue={profile.contactName}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-white">Phone</span>
            <input
              className={inputClass}
              name="phone"
              type="tel"
              defaultValue={profile.phone}
              required
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-medium text-white">
              Website
            </span>
            <input
              className={inputClass}
              name="website"
              type="url"
              placeholder="https://yourcompany.co.za"
              defaultValue={profile.website}
              required
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-medium text-white">
              Services you offer
            </span>
            <textarea
              className={`${inputClass} min-h-28`}
              name="services"
              defaultValue={profile.services}
              placeholder="e.g. Plumbing repairs, geyser installations, emergency call-outs across Johannesburg"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-white">
              Posts per
            </span>
            <select
              className={inputClass}
              name="period"
              defaultValue={profile.period}
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-white">
              How many posts
            </span>
            <input
              className={inputClass}
              name="postsPerPeriod"
              type="number"
              min={1}
              max={21}
              defaultValue={profile.postsPerPeriod}
              required
            />
          </label>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Social platforms</h3>
          <p className="text-sm text-white/55">
            Add profile URLs for the AI to mention. Connect a platform so ads can
            auto-post there.
          </p>
          {marketingPlatforms.map((platform) => {
            const social = byPlatform[platform];
            return (
              <div
                key={platform}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                <p className="text-sm font-medium text-white">
                  {platformLabel(platform)}
                  {social?.connected ? (
                    <span className="ml-2 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] text-accent">
                      Connected
                    </span>
                  ) : null}
                </p>
                <input
                  className={`${inputClass} mt-3`}
                  name={`social_${platform}`}
                  placeholder={`${platformLabel(platform)} profile URL`}
                  defaultValue={social?.profileUrl ?? ""}
                />
              </div>
            );
          })}
          {!publisherConfigured ? (
            <p className="text-xs text-amber-200/90">
              Auto-post connect buttons appear after AYRSHARE_API_KEY is
              configured on the server.
            </p>
          ) : null}
        </div>

        <label className="flex items-center gap-3 text-sm text-white/80">
          <input
            type="checkbox"
            name="active"
            defaultChecked={profile.active}
            className="size-4 rounded border-white/20 bg-black"
          />
          Turn on auto-posting when at least one platform is connected
        </label>

        <Button type="submit" variant="solid" disabled={pending}>
          {pending ? "Saving…" : "Save setup and queue ads"}
        </Button>
      </form>

      {publisherConfigured ? (
        <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm font-medium text-white">Connect for auto-post</p>
          <div className="flex flex-wrap gap-2">
            {marketingPlatforms
              .filter((platform) => platform !== "whatsapp")
              .map((platform) => (
                <form key={platform} action={connectMarketingSocial}>
                  <input type="hidden" name="platform" value={platform} />
                  <button
                    type="submit"
                    className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-accent transition hover:border-accent/40"
                  >
                    Connect {platformLabel(platform)}
                  </button>
                </form>
              ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
