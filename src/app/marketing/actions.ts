"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { emailsMatch } from "@/lib/admin/auth";
import { createUserClient } from "@/lib/supabase/server";
import {
  ensureMarketingProfile,
  getMarketingAuthUser,
} from "@/lib/marketing/auth";
import {
  getMarketingPost,
  getMarketingProfileByUserId,
  listMarketingSocials,
  marketingPlatforms,
  type MarketingPeriod,
  type MarketingPlatform,
  updateMarketingPost,
  updateMarketingProfile,
  upsertMarketingSocial,
} from "@/lib/marketing/store";
import { refillMarketingQueue } from "@/lib/marketing/queue";
import { getSocialConnectUrl } from "@/lib/marketing/publish";
import { isMarketingPublicEnabled } from "@/lib/site-settings/store";

export type MarketingAuthState = {
  ok: boolean;
  message: string;
};

export type MarketingFormState = {
  ok: boolean;
  message: string;
};

function siteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return `https://${production}`;
  const preview = process.env.VERCEL_URL?.trim();
  if (preview) return `https://${preview}`;
  return "http://localhost:3000";
}

function normalizeWebsite(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export async function signUpMarketing(
  _prev: MarketingAuthState,
  formData: FormData,
): Promise<MarketingAuthState> {
  if (!(await isMarketingPublicEnabled())) {
    return {
      ok: false,
      message: "Business marketing signup is temporarily unavailable.",
    };
  }

  const name = String(formData.get("name") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (name.length < 2) return { ok: false, message: "Please enter your name." };
  if (company.length < 2) {
    return { ok: false, message: "Please enter your company name." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }
  if (phone.length < 7) {
    return { ok: false, message: "Please enter a valid phone number." };
  }
  if (password.length < 8) {
    return { ok: false, message: "Password must be at least 8 characters." };
  }
  if (process.env.ADMIN_EMAIL && emailsMatch(email, process.env.ADMIN_EMAIL)) {
    return {
      ok: false,
      message: "This email is reserved. Use a company email instead.",
    };
  }

  const supabase = await createUserClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl()}/marketing/auth/callback`,
      data: {
        kind: "marketing",
        name,
        company,
        phone,
      },
    },
  });

  if (error) {
    const duplicate =
      error.message.toLowerCase().includes("already") ||
      error.message.toLowerCase().includes("registered");
    return {
      ok: false,
      message: duplicate
        ? "An account with this email already exists. Log in instead."
        : error.message,
    };
  }

  if (data.user) {
    try {
      await ensureMarketingProfile({
        id: data.user.id,
        email,
        name,
        company,
        phone,
        emailConfirmed: Boolean(data.user.email_confirmed_at),
      });
    } catch {
      // Profile can be created on first verified login if signup has no session yet.
    }
  }

  if (data.session) {
    redirect("/marketing/verify");
  }

  redirect(`/marketing/verify?email=${encodeURIComponent(email)}`);
}

export async function signInMarketing(
  _prev: MarketingAuthState,
  formData: FormData,
): Promise<MarketingAuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const supabase = await createUserClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user?.email) {
    return { ok: false, message: "Incorrect email or password." };
  }

  const metadata = data.user.user_metadata ?? {};
  if (metadata.kind !== "marketing") {
    await supabase.auth.signOut();
    return {
      ok: false,
      message:
        "This login is for Business marketing accounts. Use the client log in for support tickets.",
    };
  }

  await ensureMarketingProfile({
    id: data.user.id,
    email: data.user.email,
    name: typeof metadata.name === "string" ? metadata.name : "",
    company: typeof metadata.company === "string" ? metadata.company : "",
    phone: typeof metadata.phone === "string" ? metadata.phone : "",
    emailConfirmed: Boolean(data.user.email_confirmed_at),
  });

  if (!data.user.email_confirmed_at) redirect("/marketing/verify");
  redirect("/marketing/app");
}

export async function signOutMarketing() {
  const supabase = await createUserClient();
  await supabase.auth.signOut();
  redirect("/marketing");
}

export async function resendMarketingVerification(): Promise<MarketingAuthState> {
  const user = await getMarketingAuthUser();
  if (!user) return { ok: false, message: "Please log in first." };
  if (user.emailConfirmed) {
    redirect("/marketing/app");
  }

  const supabase = await createUserClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: user.email,
    options: {
      emailRedirectTo: `${siteUrl()}/marketing/auth/callback`,
    },
  });

  if (error) return { ok: false, message: error.message };
  return {
    ok: true,
    message: "Verification email sent. Check your inbox and spam folder.",
  };
}

export async function saveMarketingSetup(
  _prev: MarketingFormState,
  formData: FormData,
): Promise<MarketingFormState> {
  const user = await getMarketingAuthUser();
  if (!user?.emailConfirmed) {
    return { ok: false, message: "Verify your email before saving setup." };
  }

  const profile = await getMarketingProfileByUserId(user.id);
  if (!profile) return { ok: false, message: "Marketing profile not found." };

  const company = String(formData.get("company") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const website = normalizeWebsite(String(formData.get("website") ?? ""));
  const services = String(formData.get("services") ?? "").trim();
  const period = String(formData.get("period") ?? "day") as MarketingPeriod;
  const postsPerPeriod = Number(String(formData.get("postsPerPeriod") ?? "1"));
  const active = String(formData.get("active") ?? "") === "on";

  if (company.length < 2) {
    return { ok: false, message: "Please enter your company name." };
  }
  if (phone.length < 7) {
    return { ok: false, message: "Please enter a phone number clients can call." };
  }
  if (!website) {
    return { ok: false, message: "Please enter your website." };
  }
  if (services.length < 8) {
    return {
      ok: false,
      message: "Describe the services you offer so AI can advertise them.",
    };
  }
  if (period !== "day" && period !== "week") {
    return { ok: false, message: "Choose daily or weekly posting." };
  }
  if (
    !Number.isFinite(postsPerPeriod) ||
    postsPerPeriod < 1 ||
    postsPerPeriod > (period === "day" ? 6 : 21)
  ) {
    return {
      ok: false,
      message:
        period === "day"
          ? "Choose 1–6 posts per day."
          : "Choose 1–21 posts per week.",
    };
  }

  for (const platform of marketingPlatforms) {
    const url = String(formData.get(`social_${platform}`) ?? "").trim();
    await upsertMarketingSocial({
      profileId: profile.id,
      platform,
      profileUrl: url,
    });
  }

  const socials = await listMarketingSocials(profile.id);
  const hasConnected = socials.some((social) => social.connected);
  const hasUrl = socials.some((social) => social.profileUrl.trim());
  if (!hasUrl) {
    return {
      ok: false,
      message: "Add at least one social profile URL.",
    };
  }

  await updateMarketingProfile(profile.id, {
    company,
    contactName: contactName || user.name,
    phone,
    website,
    services,
    period,
    postsPerPeriod,
    setupComplete: true,
    active: active && hasConnected,
  });

  try {
    await refillMarketingQueue(profile.id);
  } catch (error) {
    revalidatePath("/marketing/app");
    return {
      ok: true,
      message:
        error instanceof Error
          ? `Setup saved, but ads could not be generated yet: ${error.message}`
          : "Setup saved, but ads could not be generated yet.",
    };
  }

  revalidatePath("/marketing/app");
  revalidatePath("/admin/marketing");
  return {
    ok: true,
    message: hasConnected
      ? "Setup saved. AI ads are queued for your schedule."
      : "Setup saved. Connect at least one social platform to start auto-posting.",
  };
}

export async function connectMarketingSocial(formData: FormData) {
  const user = await getMarketingAuthUser();
  if (!user?.emailConfirmed) redirect("/marketing/verify");

  const platform = String(formData.get("platform") ?? "") as MarketingPlatform;
  if (!marketingPlatforms.includes(platform)) redirect("/marketing/app");

  const profile = await getMarketingProfileByUserId(user.id);
  if (!profile) redirect("/marketing/app");

  const url = await getSocialConnectUrl(profile, platform);
  if (!url) {
    redirect(`/marketing/app?connect=unavailable&platform=${platform}`);
  }
  redirect(url);
}

export async function updateQueuedPost(
  _prev: MarketingFormState,
  formData: FormData,
): Promise<MarketingFormState> {
  const user = await getMarketingAuthUser();
  if (!user?.emailConfirmed) {
    return { ok: false, message: "Verify your email first." };
  }

  const profile = await getMarketingProfileByUserId(user.id);
  if (!profile) return { ok: false, message: "Profile not found." };

  const postId = String(formData.get("postId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const post = await getMarketingPost(postId);
  if (!post || post.profileId !== profile.id) {
    return { ok: false, message: "Post not found." };
  }
  if (post.status !== "queued") {
    return { ok: false, message: "Only queued posts can be edited." };
  }
  if (body.length < 20) {
    return { ok: false, message: "Post copy is too short." };
  }

  await updateMarketingPost(postId, { body });
  revalidatePath("/marketing/app");
  return { ok: true, message: "Post updated." };
}

export async function cancelQueuedPost(formData: FormData) {
  const user = await getMarketingAuthUser();
  if (!user?.emailConfirmed) redirect("/marketing/verify");
  const profile = await getMarketingProfileByUserId(user.id);
  if (!profile) redirect("/marketing/app");

  const postId = String(formData.get("postId") ?? "");
  const post = await getMarketingPost(postId);
  if (post && post.profileId === profile.id && post.status === "queued") {
    await updateMarketingPost(postId, { status: "cancelled" });
  }
  revalidatePath("/marketing/app");
  redirect("/marketing/app");
}

export async function regenerateMarketingQueue(): Promise<MarketingFormState> {
  const user = await getMarketingAuthUser();
  if (!user?.emailConfirmed) {
    return { ok: false, message: "Verify your email first." };
  }
  const profile = await getMarketingProfileByUserId(user.id);
  if (!profile?.setupComplete) {
    return { ok: false, message: "Complete setup before generating ads." };
  }

  try {
    await refillMarketingQueue(profile.id, { force: true });
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Could not generate ads right now.",
    };
  }

  revalidatePath("/marketing/app");
  return { ok: true, message: "New ads queued for your schedule." };
}
