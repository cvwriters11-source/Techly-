import { randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export type ProjectRecord = {
  id: string;
  createdAt: string;
  title: string;
  url: string;
  summary: string;
  imageUrl: string;
  sortOrder: number;
};

type ProjectRow = {
  id: string;
  created_at: string;
  title: string;
  url: string;
  summary: string | null;
  image_url: string | null;
  sort_order: number | null;
};

function createId() {
  const stamp = Date.now().toString(36).toUpperCase();
  const noise = randomBytes(3).toString("hex").toUpperCase();
  return `PRJ-${stamp}-${noise}`;
}

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

function mapProject(row: ProjectRow): ProjectRecord {
  return {
    id: row.id,
    createdAt: row.created_at,
    title: row.title,
    url: row.url,
    summary: row.summary ?? "",
    imageUrl: row.image_url ?? "",
    sortOrder: row.sort_order ?? 0,
  };
}

export function normalizeHttpUrl(raw: string) {
  const value = raw.trim();
  if (!value) return "";
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  const parsed = new URL(withProtocol);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Enter a valid website link.");
  }
  return parsed.toString();
}

export async function listProjects() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  throwIfError(error);
  return (data as ProjectRow[]).map(mapProject);
}

export async function listPublicProjects() {
  try {
    return await listProjects();
  } catch {
    return [];
  }
}

export async function getProject(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  throwIfError(error);
  return data ? mapProject(data as ProjectRow) : null;
}

export async function saveProject(input: {
  title: string;
  url: string;
  summary: string;
  imageUrl: string;
  sortOrder: number;
}) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      id: createId(),
      title: input.title,
      url: input.url,
      summary: input.summary,
      image_url: input.imageUrl,
      sort_order: input.sortOrder,
    })
    .select()
    .single();

  throwIfError(error);
  return mapProject(data as ProjectRow);
}

export async function updateProject(
  id: string,
  input: {
    title: string;
    url: string;
    summary: string;
    imageUrl: string;
    sortOrder: number;
  },
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("projects")
    .update({
      title: input.title,
      url: input.url,
      summary: input.summary,
      image_url: input.imageUrl,
      sort_order: input.sortOrder,
    })
    .eq("id", id)
    .select()
    .maybeSingle();

  throwIfError(error);
  return data ? mapProject(data as ProjectRow) : null;
}

export async function deleteProject(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  throwIfError(error);
}
