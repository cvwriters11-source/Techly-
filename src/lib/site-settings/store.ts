import { createAdminClient } from "@/lib/supabase/admin";

export const MARKETING_PUBLIC_ENABLED_KEY = "marketing_public_enabled";
export const CAREER_PUBLIC_ENABLED_KEY = "career_public_enabled";

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export async function getSiteSettingBoolean(
  key: string,
  fallback: boolean,
): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();

    throwIfError(error);
    if (!data) return fallback;
    if (typeof data.value === "boolean") return data.value;
    if (data.value === "true" || data.value === "false") {
      return data.value === "true";
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export async function isMarketingPublicEnabled() {
  return getSiteSettingBoolean(MARKETING_PUBLIC_ENABLED_KEY, true);
}

export async function setMarketingPublicEnabled(enabled: boolean) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("site_settings").upsert(
    {
      key: MARKETING_PUBLIC_ENABLED_KEY,
      value: enabled,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );

  throwIfError(error);
}

export async function isCareerPublicEnabled() {
  return getSiteSettingBoolean(CAREER_PUBLIC_ENABLED_KEY, true);
}

export async function setCareerPublicEnabled(enabled: boolean) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("site_settings").upsert(
    {
      key: CAREER_PUBLIC_ENABLED_KEY,
      value: enabled,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );

  throwIfError(error);
}
