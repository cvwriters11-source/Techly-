"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { emailsMatch } from "@/lib/admin/auth";
import { createUserClient } from "@/lib/supabase/server";
import {
  ensureCareerProfile,
  getCareerAuthUser,
} from "@/lib/career/auth";
import {
  completeCareerSession,
  continueCareerCoachTurn,
  startCareerCoachTurn,
} from "@/lib/career/coach";
import {
  careerDurations,
  careerFocuses,
  careerVoices,
  createCareerSession,
  getCareerProfileByUserId,
  getCareerSession,
  updateCareerProfile,
  type CareerDuration,
  type CareerFocus,
  type CareerVoice,
} from "@/lib/career/store";
import { isCareerPublicEnabled } from "@/lib/site-settings/store";

export type CareerAuthState = {
  ok: boolean;
  message: string;
};

export type CareerFormState = {
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

export async function signUpCareer(
  _prev: CareerAuthState,
  formData: FormData,
): Promise<CareerAuthState> {
  if (!(await isCareerPublicEnabled())) {
    return {
      ok: false,
      message: "Career coach signup is temporarily unavailable.",
    };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (name.length < 2) return { ok: false, message: "Please enter your name." };
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
      message: "This email is reserved. Use your personal email instead.",
    };
  }

  const supabase = await createUserClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl()}/career/auth/callback`,
      data: {
        kind: "career",
        name,
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
      await ensureCareerProfile({
        id: data.user.id,
        email,
        name,
        phone,
        emailConfirmed: Boolean(data.user.email_confirmed_at),
      });
    } catch {
      // Profile can be created on first verified login.
    }
  }

  if (data.session) {
    redirect("/career/verify");
  }

  redirect(`/career/verify?email=${encodeURIComponent(email)}`);
}

export async function signInCareer(
  _prev: CareerAuthState,
  formData: FormData,
): Promise<CareerAuthState> {
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
  if (metadata.kind !== "career") {
    await supabase.auth.signOut();
    return {
      ok: false,
      message:
        "This login is for Career coach accounts. Use the client log in for support tickets.",
    };
  }

  await ensureCareerProfile({
    id: data.user.id,
    email: data.user.email,
    name: typeof metadata.name === "string" ? metadata.name : "",
    phone: typeof metadata.phone === "string" ? metadata.phone : "",
    emailConfirmed: Boolean(data.user.email_confirmed_at),
  });

  if (!data.user.email_confirmed_at) redirect("/career/verify");
  redirect("/career/app");
}

export async function signOutCareer() {
  const supabase = await createUserClient();
  await supabase.auth.signOut();
  redirect("/career");
}

export async function resendCareerVerification(): Promise<CareerAuthState> {
  const user = await getCareerAuthUser();
  if (!user) return { ok: false, message: "Please log in first." };
  if (user.emailConfirmed) {
    redirect("/career/app");
  }

  const supabase = await createUserClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: user.email,
    options: {
      emailRedirectTo: `${siteUrl()}/career/auth/callback`,
    },
  });

  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Verification email sent. Check your inbox." };
}

export async function resendCareerVerificationForEmail(
  _prev: CareerAuthState,
  formData: FormData,
): Promise<CareerAuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  const supabase = await createUserClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${siteUrl()}/career/auth/callback`,
    },
  });

  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Verification email sent. Check your inbox." };
}

export async function saveCareerSetup(
  _prev: CareerFormState,
  formData: FormData,
): Promise<CareerFormState> {
  const user = await getCareerAuthUser();
  if (!user?.emailConfirmed) {
    return { ok: false, message: "Please verify your email first." };
  }

  const profile = await getCareerProfileByUserId(user.id);
  if (!profile) return { ok: false, message: "Profile not found." };

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const targetRole = String(formData.get("targetRole") ?? "").trim();
  const focusRaw = String(formData.get("focus") ?? "interview").trim();
  const voiceRaw = String(formData.get("voice") ?? "woman").trim();
  const durationRaw = Number(formData.get("duration") ?? 30);

  const focus = careerFocuses.includes(focusRaw as CareerFocus)
    ? (focusRaw as CareerFocus)
    : null;
  const voice = careerVoices.includes(voiceRaw as CareerVoice)
    ? (voiceRaw as CareerVoice)
    : null;
  const duration = careerDurations.includes(durationRaw as CareerDuration)
    ? (durationRaw as CareerDuration)
    : null;

  if (name.length < 2) return { ok: false, message: "Please enter your name." };
  if (targetRole.length < 2) {
    return { ok: false, message: "Please enter the role you are preparing for." };
  }
  if (!focus || !voice || !duration) {
    return { ok: false, message: "Choose focus, voice, and session length." };
  }

  await updateCareerProfile(profile.id, {
    name,
    phone,
    targetRole,
    focus,
    preferredVoice: voice,
    preferredDuration: duration,
  });

  revalidatePath("/career/app");
  return { ok: true, message: "Preferences saved." };
}

export async function startCareerSessionAction(
  _prev: CareerFormState,
  formData: FormData,
): Promise<CareerFormState> {
  const user = await getCareerAuthUser();
  if (!user?.emailConfirmed) {
    return { ok: false, message: "Please verify your email first." };
  }

  const profile = await getCareerProfileByUserId(user.id);
  if (!profile) return { ok: false, message: "Profile not found." };

  const targetRole = String(
    formData.get("targetRole") ?? profile.targetRole,
  ).trim();
  const focusRaw = String(formData.get("focus") ?? profile.focus).trim();
  const voiceRaw = String(formData.get("voice") ?? profile.preferredVoice).trim();
  const durationRaw = Number(
    formData.get("duration") ?? profile.preferredDuration,
  );

  const focus = careerFocuses.includes(focusRaw as CareerFocus)
    ? (focusRaw as CareerFocus)
    : profile.focus;
  const voice = careerVoices.includes(voiceRaw as CareerVoice)
    ? (voiceRaw as CareerVoice)
    : profile.preferredVoice;
  const duration = careerDurations.includes(durationRaw as CareerDuration)
    ? (durationRaw as CareerDuration)
    : profile.preferredDuration;

  if (targetRole.length < 2) {
    return { ok: false, message: "Please enter the role you are preparing for." };
  }

  await updateCareerProfile(profile.id, {
    targetRole,
    focus,
    preferredVoice: voice,
    preferredDuration: duration,
  });

  const session = await createCareerSession({
    profileId: profile.id,
    voice,
    durationMinutes: duration,
    focus,
    targetRole,
  });

  try {
    await startCareerCoachTurn(session.id);
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Session created but the coach could not start. Open it from Recent sessions.",
    };
  }

  redirect(`/career/session/${session.id}`);
}

export async function submitCareerAnswerAction(
  sessionId: string,
  answer: string,
) {
  const user = await getCareerAuthUser();
  if (!user?.emailConfirmed) {
    throw new Error("Please log in first.");
  }

  const profile = await getCareerProfileByUserId(user.id);
  const session = await getCareerSession(sessionId);
  if (!profile || !session || session.profileId !== profile.id) {
    throw new Error("Session not found.");
  }

  return continueCareerCoachTurn(sessionId, answer);
}

export async function finishCareerSessionAction(sessionId: string) {
  const user = await getCareerAuthUser();
  if (!user?.emailConfirmed) {
    throw new Error("Please log in first.");
  }

  const profile = await getCareerProfileByUserId(user.id);
  const session = await getCareerSession(sessionId);
  if (!profile || !session || session.profileId !== profile.id) {
    throw new Error("Session not found.");
  }

  const completed = await completeCareerSession(sessionId);
  revalidatePath(`/career/session/${sessionId}`);
  revalidatePath("/career/app");
  return completed;
}
