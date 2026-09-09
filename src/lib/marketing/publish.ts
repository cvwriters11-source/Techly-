import type {
  MarketingPlatform,
  MarketingProfile,
} from "@/lib/marketing/store";

const AYRSHARE_PLATFORMS: Partial<Record<MarketingPlatform, string>> = {
  facebook: "facebook",
  instagram: "instagram",
  linkedin: "linkedin",
  x: "twitter",
  tiktok: "tiktok",
};

function env(name: string) {
  return process.env[name]?.trim() || "";
}

export function isSocialPublisherConfigured() {
  return Boolean(env("AYRSHARE_API_KEY"));
}

function siteUrl() {
  const explicit = env("NEXT_PUBLIC_SITE_URL").replace(/\/$/, "");
  if (explicit) return explicit;
  const production = env("VERCEL_PROJECT_PRODUCTION_URL");
  if (production) return `https://${production}`;
  const preview = env("VERCEL_URL");
  if (preview) return `https://${preview}`;
  return "http://localhost:3000";
}

export async function getSocialConnectUrl(
  profile: MarketingProfile,
  platform: MarketingPlatform,
) {
  const apiKey = env("AYRSHARE_API_KEY");
  if (!apiKey) return null;
  if (!AYRSHARE_PLATFORMS[platform]) return null;

  const redirectUrl = `${siteUrl()}/marketing/app?connected=${platform}`;
  const response = await fetch("https://app.ayrshare.com/api/profiles/generateJWT", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      domain: env("AYRSHARE_DOMAIN") || undefined,
      privateKey: env("AYRSHARE_PRIVATE_KEY") || undefined,
      profileKey: profile.providerProfileKey || undefined,
      title: profile.company,
      redirectUrl,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Could not start social connect.");
  }

  const data = (await response.json()) as {
    url?: string;
    profileKey?: string;
  };

  if (data.profileKey && data.profileKey !== profile.providerProfileKey) {
    const { updateMarketingProfile } = await import("@/lib/marketing/store");
    await updateMarketingProfile(profile.id, {
      providerProfileKey: data.profileKey,
    });
  }

  return data.url || null;
}

export async function publishMarketingPost(input: {
  profile: MarketingProfile;
  body: string;
  platforms: MarketingPlatform[];
}) {
  const apiKey = env("AYRSHARE_API_KEY");
  if (!apiKey) {
    return {
      ok: false as const,
      error:
        "Social publishing is not configured. Add AYRSHARE_API_KEY to enable auto-post.",
      results: {} as Record<string, unknown>,
    };
  }

  if (!input.profile.providerProfileKey) {
    return {
      ok: false as const,
      error: "Connect at least one social platform before auto-posting.",
      results: {} as Record<string, unknown>,
    };
  }

  const platforms = input.platforms
    .map((platform) => AYRSHARE_PLATFORMS[platform])
    .filter((value): value is string => Boolean(value));

  if (platforms.length === 0) {
    return {
      ok: false as const,
      error: "No connected platforms support auto-post yet.",
      results: {} as Record<string, unknown>,
    };
  }

  const response = await fetch("https://app.ayrshare.com/api/post", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Profile-Key": input.profile.providerProfileKey,
    },
    body: JSON.stringify({
      post: input.body,
      platforms,
    }),
  });

  const results = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  if (!response.ok) {
    return {
      ok: false as const,
      error:
        typeof results.message === "string"
          ? results.message
          : "The social post could not be published.",
      results,
    };
  }

  return { ok: true as const, results };
}

export async function syncConnectedPlatforms(profile: MarketingProfile) {
  const apiKey = env("AYRSHARE_API_KEY");
  if (!apiKey || !profile.providerProfileKey) return [];

  const response = await fetch("https://app.ayrshare.com/api/user", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Profile-Key": profile.providerProfileKey,
    },
  });

  if (!response.ok) return [];
  const data = (await response.json()) as {
    activeSocialAccounts?: string[];
  };

  const accounts = data.activeSocialAccounts ?? [];
  const reverse: Record<string, MarketingPlatform> = {
    facebook: "facebook",
    instagram: "instagram",
    linkedin: "linkedin",
    twitter: "x",
    tiktok: "tiktok",
  };

  return accounts
    .map((account) => reverse[account])
    .filter((value): value is MarketingPlatform => Boolean(value));
}
