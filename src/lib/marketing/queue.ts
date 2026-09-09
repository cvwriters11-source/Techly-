import {
  countQueuedPosts,
  createMarketingPost,
  getMarketingProfile,
  listMarketingPosts,
  listMarketingSocials,
  updateMarketingProfile,
  type MarketingProfile,
} from "@/lib/marketing/store";
import { generateMarketingAdCopy } from "@/lib/marketing/generate";
import { syncConnectedPlatforms } from "@/lib/marketing/publish";

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function scheduleSlots(profile: MarketingProfile, count: number) {
  const now = new Date();
  const hoursBetween =
    profile.period === "day"
      ? Math.max(2, Math.floor(24 / profile.postsPerPeriod))
      : Math.max(8, Math.floor((24 * 7) / profile.postsPerPeriod));

  const slots: string[] = [];
  let cursor = addHours(now, 1);
  // Prefer business hours in SAST-ish window (08:00–17:00 local approximation).
  for (let i = 0; i < count; i += 1) {
    const hour = cursor.getHours();
    if (hour < 8) cursor.setHours(8, 0, 0, 0);
    if (hour >= 17) {
      cursor = addHours(cursor, 15);
      cursor.setHours(9, 0, 0, 0);
    }
    slots.push(cursor.toISOString());
    cursor = addHours(cursor, hoursBetween);
  }
  return slots;
}

export async function refillMarketingQueue(
  profileId: string,
  options?: { force?: boolean },
) {
  const profile = await getMarketingProfile(profileId);
  if (!profile?.setupComplete) {
    throw new Error("Complete company setup before generating ads.");
  }

  const socials = await listMarketingSocials(profile.id);
  try {
    const connected = await syncConnectedPlatforms(profile);
    if (connected.length > 0) {
      const { upsertMarketingSocial } = await import("@/lib/marketing/store");
      for (const platform of connected) {
        const existing = socials.find((social) => social.platform === platform);
        await upsertMarketingSocial({
          profileId: profile.id,
          platform,
          profileUrl: existing?.profileUrl ?? "",
          connected: true,
        });
      }
      if (!profile.active) {
        await updateMarketingProfile(profile.id, { active: true });
      }
    }
  } catch {
    // Connection sync is best-effort; queue generation can still continue.
  }

  const queued = await countQueuedPosts(profile.id);
  const target =
    profile.period === "day"
      ? Math.max(profile.postsPerPeriod * 3, 3)
      : Math.max(profile.postsPerPeriod, 3);

  if (!options?.force && queued >= target) return { created: 0 };

  const needed = options?.force ? target : target - queued;
  const recent = await listMarketingPosts(profile.id, { limit: 8 });
  const slots = scheduleSlots(profile, needed);
  let created = 0;

  for (const scheduledFor of slots) {
    const body = await generateMarketingAdCopy({
      profile,
      socials,
      recentBodies: recent.map((post) => post.body),
    });
    const post = await createMarketingPost({
      profileId: profile.id,
      body,
      scheduledFor,
    });
    recent.unshift(post);
    created += 1;
  }

  return { created };
}
