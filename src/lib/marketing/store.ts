import { randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export const marketingPlatforms = [
  "facebook",
  "instagram",
  "linkedin",
  "x",
  "whatsapp",
  "tiktok",
] as const;

export type MarketingPlatform = (typeof marketingPlatforms)[number];
export type MarketingPeriod = "day" | "week";
export type MarketingPostStatus = "queued" | "posted" | "failed" | "cancelled";

export type MarketingProfile = {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  company: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  services: string;
  timezone: string;
  postsPerPeriod: number;
  period: MarketingPeriod;
  active: boolean;
  setupComplete: boolean;
  providerProfileKey: string;
};

export type MarketingSocial = {
  id: string;
  createdAt: string;
  profileId: string;
  platform: MarketingPlatform;
  profileUrl: string;
  connected: boolean;
  providerPlatformId: string;
};

export type MarketingPost = {
  id: string;
  createdAt: string;
  profileId: string;
  body: string;
  scheduledFor: string;
  status: MarketingPostStatus;
  platformResults: Record<string, unknown>;
  error: string;
};

type ProfileRow = {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  company: string;
  contact_name: string;
  email: string;
  phone: string;
  website: string;
  services: string;
  timezone: string;
  posts_per_period: number;
  period: string;
  active: boolean | null;
  setup_complete: boolean | null;
  provider_profile_key: string | null;
};

type SocialRow = {
  id: string;
  created_at: string;
  profile_id: string;
  platform: string;
  profile_url: string;
  connected: boolean | null;
  provider_platform_id: string | null;
};

type PostRow = {
  id: string;
  created_at: string;
  profile_id: string;
  body: string;
  scheduled_for: string;
  status: string;
  platform_results: Record<string, unknown> | null;
  error: string | null;
};

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

function createId(prefix: string) {
  const stamp = Date.now().toString(36).toUpperCase();
  const noise = randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}-${stamp}-${noise}`;
}

function isPlatform(value: string): value is MarketingPlatform {
  return marketingPlatforms.includes(value as MarketingPlatform);
}

function mapProfile(row: ProfileRow): MarketingProfile {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    userId: row.user_id,
    company: row.company,
    contactName: row.contact_name ?? "",
    email: row.email,
    phone: row.phone ?? "",
    website: row.website ?? "",
    services: row.services ?? "",
    timezone: row.timezone || "Africa/Johannesburg",
    postsPerPeriod: row.posts_per_period || 1,
    period: row.period === "week" ? "week" : "day",
    active: Boolean(row.active),
    setupComplete: Boolean(row.setup_complete),
    providerProfileKey: row.provider_profile_key ?? "",
  };
}

function mapSocial(row: SocialRow): MarketingSocial {
  return {
    id: row.id,
    createdAt: row.created_at,
    profileId: row.profile_id,
    platform: isPlatform(row.platform) ? row.platform : "facebook",
    profileUrl: row.profile_url ?? "",
    connected: Boolean(row.connected),
    providerPlatformId: row.provider_platform_id ?? "",
  };
}

function mapPost(row: PostRow): MarketingPost {
  return {
    id: row.id,
    createdAt: row.created_at,
    profileId: row.profile_id,
    body: row.body,
    scheduledFor: row.scheduled_for,
    status: (["queued", "posted", "failed", "cancelled"].includes(row.status)
      ? row.status
      : "queued") as MarketingPostStatus,
    platformResults: row.platform_results ?? {},
    error: row.error ?? "",
  };
}

export async function getOrCreateMarketingProfile(input: {
  userId: string;
  email: string;
  company: string;
  contactName: string;
  phone: string;
}) {
  const supabase = createAdminClient();
  const existing = await supabase
    .from("marketing_profiles")
    .select("*")
    .eq("user_id", input.userId)
    .maybeSingle();

  throwIfError(existing.error);
  if (existing.data) return mapProfile(existing.data as ProfileRow);

  const { data, error } = await supabase
    .from("marketing_profiles")
    .insert({
      id: createId("MKT"),
      user_id: input.userId,
      company: input.company,
      contact_name: input.contactName,
      email: input.email,
      phone: input.phone,
    })
    .select("*")
    .single();

  throwIfError(error);
  return mapProfile(data as ProfileRow);
}

export async function getMarketingProfileByUserId(userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("marketing_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  throwIfError(error);
  return data ? mapProfile(data as ProfileRow) : null;
}

export async function getMarketingProfile(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("marketing_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  throwIfError(error);
  return data ? mapProfile(data as ProfileRow) : null;
}

export async function listMarketingProfiles() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("marketing_profiles")
    .select("*")
    .order("created_at", { ascending: false });
  throwIfError(error);
  return ((data as ProfileRow[]) ?? []).map(mapProfile);
}

export async function listActiveMarketingProfiles() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("marketing_profiles")
    .select("*")
    .eq("active", true)
    .eq("setup_complete", true);
  throwIfError(error);
  return ((data as ProfileRow[]) ?? []).map(mapProfile);
}

export async function updateMarketingProfile(
  id: string,
  patch: Partial<{
    company: string;
    contactName: string;
    phone: string;
    website: string;
    services: string;
    timezone: string;
    postsPerPeriod: number;
    period: MarketingPeriod;
    active: boolean;
    setupComplete: boolean;
    providerProfileKey: string;
  }>,
) {
  const supabase = createAdminClient();
  const next: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (typeof patch.company === "string") next.company = patch.company;
  if (typeof patch.contactName === "string") next.contact_name = patch.contactName;
  if (typeof patch.phone === "string") next.phone = patch.phone;
  if (typeof patch.website === "string") next.website = patch.website;
  if (typeof patch.services === "string") next.services = patch.services;
  if (typeof patch.timezone === "string") next.timezone = patch.timezone;
  if (typeof patch.postsPerPeriod === "number") {
    next.posts_per_period = patch.postsPerPeriod;
  }
  if (patch.period) next.period = patch.period;
  if (typeof patch.active === "boolean") next.active = patch.active;
  if (typeof patch.setupComplete === "boolean") {
    next.setup_complete = patch.setupComplete;
  }
  if (typeof patch.providerProfileKey === "string") {
    next.provider_profile_key = patch.providerProfileKey;
  }

  const { data, error } = await supabase
    .from("marketing_profiles")
    .update(next)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  throwIfError(error);
  return data ? mapProfile(data as ProfileRow) : null;
}

export async function listMarketingSocials(profileId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("marketing_socials")
    .select("*")
    .eq("profile_id", profileId)
    .order("platform", { ascending: true });
  throwIfError(error);
  return ((data as SocialRow[]) ?? []).map(mapSocial);
}

export async function upsertMarketingSocial(input: {
  profileId: string;
  platform: MarketingPlatform;
  profileUrl: string;
  connected?: boolean;
  providerPlatformId?: string;
}) {
  const supabase = createAdminClient();
  const existing = await supabase
    .from("marketing_socials")
    .select("*")
    .eq("profile_id", input.profileId)
    .eq("platform", input.platform)
    .maybeSingle();
  throwIfError(existing.error);

  if (existing.data) {
    const { data, error } = await supabase
      .from("marketing_socials")
      .update({
        profile_url: input.profileUrl,
        connected:
          typeof input.connected === "boolean"
            ? input.connected
            : Boolean((existing.data as SocialRow).connected),
        provider_platform_id:
          input.providerPlatformId ??
          (existing.data as SocialRow).provider_platform_id ??
          "",
      })
      .eq("id", (existing.data as SocialRow).id)
      .select("*")
      .single();
    throwIfError(error);
    return mapSocial(data as SocialRow);
  }

  const { data, error } = await supabase
    .from("marketing_socials")
    .insert({
      id: createId("SOC"),
      profile_id: input.profileId,
      platform: input.platform,
      profile_url: input.profileUrl,
      connected: Boolean(input.connected),
      provider_platform_id: input.providerPlatformId ?? "",
    })
    .select("*")
    .single();
  throwIfError(error);
  return mapSocial(data as SocialRow);
}

export async function listMarketingPosts(
  profileId: string,
  options?: { limit?: number; status?: MarketingPostStatus },
) {
  const supabase = createAdminClient();
  let query = supabase
    .from("marketing_posts")
    .select("*")
    .eq("profile_id", profileId)
    .order("scheduled_for", { ascending: true });

  if (options?.status) query = query.eq("status", options.status);
  if (options?.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  throwIfError(error);
  return ((data as PostRow[]) ?? []).map(mapPost);
}

export async function countQueuedPosts(profileId: string) {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from("marketing_posts")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .eq("status", "queued");
  throwIfError(error);
  return count ?? 0;
}

export async function createMarketingPost(input: {
  profileId: string;
  body: string;
  scheduledFor: string;
}) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("marketing_posts")
    .insert({
      id: createId("POST"),
      profile_id: input.profileId,
      body: input.body,
      scheduled_for: input.scheduledFor,
      status: "queued",
    })
    .select("*")
    .single();
  throwIfError(error);
  return mapPost(data as PostRow);
}

export async function updateMarketingPost(
  id: string,
  patch: Partial<{
    body: string;
    scheduledFor: string;
    status: MarketingPostStatus;
    platformResults: Record<string, unknown>;
    error: string;
  }>,
) {
  const supabase = createAdminClient();
  const next: Record<string, unknown> = {};
  if (typeof patch.body === "string") next.body = patch.body;
  if (typeof patch.scheduledFor === "string") next.scheduled_for = patch.scheduledFor;
  if (patch.status) next.status = patch.status;
  if (patch.platformResults) next.platform_results = patch.platformResults;
  if (typeof patch.error === "string") next.error = patch.error;

  const { data, error } = await supabase
    .from("marketing_posts")
    .update(next)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  throwIfError(error);
  return data ? mapPost(data as PostRow) : null;
}

export async function getMarketingPost(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("marketing_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  throwIfError(error);
  return data ? mapPost(data as PostRow) : null;
}

export async function listDueMarketingPosts(nowIso = new Date().toISOString()) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("marketing_posts")
    .select("*")
    .eq("status", "queued")
    .lte("scheduled_for", nowIso)
    .order("scheduled_for", { ascending: true })
    .limit(50);
  throwIfError(error);
  return ((data as PostRow[]) ?? []).map(mapPost);
}

export async function getLatestPostedAt(profileId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("marketing_posts")
    .select("scheduled_for, status")
    .eq("profile_id", profileId)
    .eq("status", "posted")
    .order("scheduled_for", { ascending: false })
    .limit(1)
    .maybeSingle();
  throwIfError(error);
  return data?.scheduled_for ?? null;
}

export function platformLabel(platform: MarketingPlatform) {
  if (platform === "x") return "X";
  if (platform === "whatsapp") return "WhatsApp";
  if (platform === "tiktok") return "TikTok";
  return platform.charAt(0).toUpperCase() + platform.slice(1);
}
