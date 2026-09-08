import { randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export const siteMessageKinds = ["promotion", "warning"] as const;
export type SiteMessageKind = (typeof siteMessageKinds)[number];

export type SiteMessage = {
  id: string;
  createdAt: string;
  kind: SiteMessageKind;
  title: string;
  body: string;
  active: boolean;
  sortOrder: number;
};

type SiteMessageRow = {
  id: string;
  created_at: string;
  kind: string;
  title: string;
  body: string;
  active: boolean | null;
  sort_order: number | null;
};

export const defaultSiteMessage: SiteMessage = {
  id: "default",
  createdAt: "",
  kind: "promotion",
  title: "Custom software, IT support and CCTV — quoted for your business",
  body: "Techly builds software, websites, IT support, automation and CCTV around how you actually work. Spend a minute on a brief and we will come back with a practical quotation.",
  active: true,
  sortOrder: 0,
};

function createId() {
  const stamp = Date.now().toString(36).toUpperCase();
  const noise = randomBytes(3).toString("hex").toUpperCase();
  return `MSG-${stamp}-${noise}`;
}

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

function isKind(value: string): value is SiteMessageKind {
  return siteMessageKinds.includes(value as SiteMessageKind);
}

function mapMessage(row: SiteMessageRow): SiteMessage {
  return {
    id: row.id,
    createdAt: row.created_at,
    kind: isKind(row.kind) ? row.kind : "promotion",
    title: row.title,
    body: row.body,
    active: Boolean(row.active),
    sortOrder: row.sort_order ?? 0,
  };
}

function sortMessages(messages: SiteMessage[]) {
  return [...messages].sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "warning" ? -1 : 1;
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export async function listSiteMessages() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("site_messages")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  throwIfError(error);
  return sortMessages((data as SiteMessageRow[]).map(mapMessage));
}

export async function getSiteMessage(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("site_messages")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  throwIfError(error);
  return data ? mapMessage(data as SiteMessageRow) : null;
}

export async function getPublicSiteMessage(): Promise<SiteMessage> {
  try {
    const messages = await listSiteMessages();
    const active = messages.find((message) => message.active);
    return active ?? defaultSiteMessage;
  } catch {
    return defaultSiteMessage;
  }
}

export async function saveSiteMessage(input: {
  kind: SiteMessageKind;
  title: string;
  body: string;
  active: boolean;
  sortOrder: number;
}) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("site_messages")
    .insert({
      id: createId(),
      kind: input.kind,
      title: input.title,
      body: input.body,
      active: input.active,
      sort_order: input.sortOrder,
    })
    .select()
    .single();

  throwIfError(error);
  return mapMessage(data as SiteMessageRow);
}

export async function updateSiteMessage(
  id: string,
  input: {
    kind: SiteMessageKind;
    title: string;
    body: string;
    active: boolean;
    sortOrder: number;
  },
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("site_messages")
    .update({
      kind: input.kind,
      title: input.title,
      body: input.body,
      active: input.active,
      sort_order: input.sortOrder,
    })
    .eq("id", id)
    .select()
    .maybeSingle();

  throwIfError(error);
  return data ? mapMessage(data as SiteMessageRow) : null;
}

export async function deleteSiteMessage(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("site_messages").delete().eq("id", id);
  throwIfError(error);
}
