import { randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export const careerVoices = ["man", "woman"] as const;
export type CareerVoice = (typeof careerVoices)[number];

export const careerDurations = [20, 30, 60] as const;
export type CareerDuration = (typeof careerDurations)[number];

export const careerFocuses = [
  "interview",
  "job_hunt",
  "career_growth",
] as const;
export type CareerFocus = (typeof careerFocuses)[number];

export type CareerSessionStatus =
  | "queued"
  | "active"
  | "completed"
  | "abandoned";

export type CareerProfile = {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  targetRole: string;
  focus: CareerFocus;
  preferredVoice: CareerVoice;
  preferredDuration: CareerDuration;
};

export type CareerSession = {
  id: string;
  createdAt: string;
  profileId: string;
  voice: CareerVoice;
  durationMinutes: CareerDuration;
  focus: CareerFocus;
  targetRole: string;
  status: CareerSessionStatus;
  startedAt: string | null;
  endsAt: string | null;
  summary: string;
};

export type CareerMessage = {
  id: string;
  createdAt: string;
  sessionId: string;
  role: "coach" | "candidate";
  text: string;
  audioPath: string | null;
};

type ProfileRow = {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  target_role: string | null;
  focus: string;
  preferred_voice: string;
  preferred_duration: number;
};

type SessionRow = {
  id: string;
  created_at: string;
  profile_id: string;
  voice: string;
  duration_minutes: number;
  focus: string;
  target_role: string | null;
  status: string;
  started_at: string | null;
  ends_at: string | null;
  summary: string | null;
};

type MessageRow = {
  id: string;
  created_at: string;
  session_id: string;
  role: string;
  text: string;
  audio_path?: string | null;
};

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

function createId(prefix: string) {
  const stamp = Date.now().toString(36).toUpperCase();
  const noise = randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}-${stamp}-${noise}`;
}

function isVoice(value: string): value is CareerVoice {
  return careerVoices.includes(value as CareerVoice);
}

function isFocus(value: string): value is CareerFocus {
  return careerFocuses.includes(value as CareerFocus);
}

function isDuration(value: number): value is CareerDuration {
  return careerDurations.includes(value as CareerDuration);
}

function isStatus(value: string): value is CareerSessionStatus {
  return ["queued", "active", "completed", "abandoned"].includes(value);
}

function mapProfile(row: ProfileRow): CareerProfile {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    userId: row.user_id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? "",
    targetRole: row.target_role ?? "",
    focus: isFocus(row.focus) ? row.focus : "interview",
    preferredVoice: isVoice(row.preferred_voice) ? row.preferred_voice : "woman",
    preferredDuration: isDuration(row.preferred_duration)
      ? row.preferred_duration
      : 30,
  };
}

function mapSession(row: SessionRow): CareerSession {
  return {
    id: row.id,
    createdAt: row.created_at,
    profileId: row.profile_id,
    voice: isVoice(row.voice) ? row.voice : "woman",
    durationMinutes: isDuration(row.duration_minutes)
      ? row.duration_minutes
      : 30,
    focus: isFocus(row.focus) ? row.focus : "interview",
    targetRole: row.target_role ?? "",
    status: isStatus(row.status) ? row.status : "queued",
    startedAt: row.started_at,
    endsAt: row.ends_at,
    summary: row.summary ?? "",
  };
}

function mapMessage(row: MessageRow): CareerMessage {
  return {
    id: row.id,
    createdAt: row.created_at,
    sessionId: row.session_id,
    role: row.role === "candidate" ? "candidate" : "coach",
    text: row.text,
    audioPath: row.audio_path ?? null,
  };
}

export function focusLabel(focus: CareerFocus) {
  switch (focus) {
    case "job_hunt":
      return "job hunt techniques";
    case "career_growth":
      return "career development";
    default:
      return "interview preparation";
  }
}

export async function getOrCreateCareerProfile(input: {
  userId: string;
  email: string;
  name: string;
  phone?: string;
}) {
  const supabase = createAdminClient();
  const existing = await getCareerProfileByUserId(input.userId);
  if (existing) return existing;

  const { data, error } = await supabase
    .from("career_profiles")
    .insert({
      id: createId("CRP"),
      user_id: input.userId,
      email: input.email,
      name: input.name || "Candidate",
      phone: input.phone ?? "",
    })
    .select()
    .single();

  throwIfError(error);
  return mapProfile(data as ProfileRow);
}

export async function getCareerProfileByUserId(userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("career_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  throwIfError(error);
  return data ? mapProfile(data as ProfileRow) : null;
}

export async function getCareerProfile(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("career_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  throwIfError(error);
  return data ? mapProfile(data as ProfileRow) : null;
}

export async function updateCareerProfile(
  id: string,
  input: {
    name?: string;
    phone?: string;
    targetRole?: string;
    focus?: CareerFocus;
    preferredVoice?: CareerVoice;
    preferredDuration?: CareerDuration;
  },
) {
  const supabase = createAdminClient();
  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.name !== undefined) patch.name = input.name;
  if (input.phone !== undefined) patch.phone = input.phone;
  if (input.targetRole !== undefined) patch.target_role = input.targetRole;
  if (input.focus !== undefined) patch.focus = input.focus;
  if (input.preferredVoice !== undefined) {
    patch.preferred_voice = input.preferredVoice;
  }
  if (input.preferredDuration !== undefined) {
    patch.preferred_duration = input.preferredDuration;
  }

  const { data, error } = await supabase
    .from("career_profiles")
    .update(patch)
    .eq("id", id)
    .select()
    .maybeSingle();

  throwIfError(error);
  return data ? mapProfile(data as ProfileRow) : null;
}

export async function listCareerProfiles() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("career_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  throwIfError(error);
  return (data as ProfileRow[]).map(mapProfile);
}

export async function createCareerSession(input: {
  profileId: string;
  voice: CareerVoice;
  durationMinutes: CareerDuration;
  focus: CareerFocus;
  targetRole: string;
}) {
  const supabase = createAdminClient();
  const startedAt = new Date();
  const endsAt = new Date(
    startedAt.getTime() + input.durationMinutes * 60_000,
  );

  const { data, error } = await supabase
    .from("career_sessions")
    .insert({
      id: createId("CRS"),
      profile_id: input.profileId,
      voice: input.voice,
      duration_minutes: input.durationMinutes,
      focus: input.focus,
      target_role: input.targetRole,
      status: "active",
      started_at: startedAt.toISOString(),
      ends_at: endsAt.toISOString(),
    })
    .select()
    .single();

  throwIfError(error);
  return mapSession(data as SessionRow);
}

export async function getCareerSession(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("career_sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  throwIfError(error);
  return data ? mapSession(data as SessionRow) : null;
}

export async function listCareerSessionsForProfile(profileId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("career_sessions")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(20);

  throwIfError(error);
  return (data as SessionRow[]).map(mapSession);
}

export async function listRecentCareerSessions(limit = 40) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("career_sessions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  throwIfError(error);
  return (data as SessionRow[]).map(mapSession);
}

export async function updateCareerSession(
  id: string,
  input: {
    status?: CareerSessionStatus;
    summary?: string;
  },
) {
  const supabase = createAdminClient();
  const patch: Record<string, unknown> = {};
  if (input.status !== undefined) patch.status = input.status;
  if (input.summary !== undefined) patch.summary = input.summary;

  const { data, error } = await supabase
    .from("career_sessions")
    .update(patch)
    .eq("id", id)
    .select()
    .maybeSingle();

  throwIfError(error);
  return data ? mapSession(data as SessionRow) : null;
}

export async function addCareerMessage(input: {
  sessionId: string;
  role: "coach" | "candidate";
  text: string;
}) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("career_messages")
    .insert({
      id: createId("CRM"),
      session_id: input.sessionId,
      role: input.role,
      text: input.text,
    })
    .select()
    .single();

  throwIfError(error);
  return mapMessage(data as MessageRow);
}

export async function listCareerMessages(sessionId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("career_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  throwIfError(error);
  return (data as MessageRow[]).map(mapMessage);
}

export async function countCareerSessionsForProfile(profileId: string) {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from("career_sessions")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", profileId);

  throwIfError(error);
  return count ?? 0;
}

export async function getCareerMessage(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("career_messages")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  throwIfError(error);
  return data ? mapMessage(data as MessageRow) : null;
}

export async function updateCareerMessageAudio(
  messageId: string,
  audioPath: string,
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("career_messages")
    .update({ audio_path: audioPath })
    .eq("id", messageId)
    .select()
    .maybeSingle();

  throwIfError(error);
  return data ? mapMessage(data as MessageRow) : null;
}

export async function uploadCareerMessageAudio(input: {
  sessionId: string;
  messageId: string;
  bytes: ArrayBuffer | Buffer | Blob;
  contentType: string;
  extension: string;
}) {
  const supabase = createAdminClient();
  const path = `${input.sessionId}/${input.messageId}.${input.extension}`;
  const { error } = await supabase.storage
    .from("career-audio")
    .upload(path, input.bytes, {
      contentType: input.contentType,
      upsert: true,
    });
  throwIfError(error);
  return updateCareerMessageAudio(input.messageId, path);
}

export async function downloadCareerMessageAudio(audioPath: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from("career-audio")
    .download(audioPath);
  throwIfError(error);
  return data;
}

export async function listCareerSessionsWithProfiles(limit = 60) {
  const sessions = await listRecentCareerSessions(limit);
  const profiles = await listCareerProfiles();
  const byId = new Map(profiles.map((profile) => [profile.id, profile]));
  return sessions.map((session) => ({
    session,
    profile: byId.get(session.profileId) ?? null,
  }));
}
