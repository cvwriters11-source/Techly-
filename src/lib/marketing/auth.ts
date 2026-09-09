import { createAdminClient } from "@/lib/supabase/admin";
import { createUserClient } from "@/lib/supabase/server";

export type MarketingUser = {
  id: string;
  email: string;
  name: string;
  company: string;
  phone: string;
  emailConfirmed: boolean;
};

export async function getMarketingAuthUser(): Promise<MarketingUser | null> {
  try {
    const supabase = await createUserClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user?.email) return null;

    const metadata = user.user_metadata ?? {};
    if (metadata.kind !== "marketing") return null;

    return {
      id: user.id,
      email: user.email,
      name: typeof metadata.name === "string" ? metadata.name : "",
      company: typeof metadata.company === "string" ? metadata.company : "",
      phone: typeof metadata.phone === "string" ? metadata.phone : "",
      emailConfirmed: Boolean(user.email_confirmed_at),
    };
  } catch {
    return null;
  }
}

export async function ensureMarketingProfile(user: MarketingUser) {
  const { getOrCreateMarketingProfile } = await import("@/lib/marketing/store");
  return getOrCreateMarketingProfile({
    userId: user.id,
    email: user.email,
    company: user.company,
    contactName: user.name,
    phone: user.phone,
  });
}

export async function requireMarketingUser(options?: {
  requireVerified?: boolean;
}) {
  const { redirect } = await import("next/navigation");
  const user = await getMarketingAuthUser();
  if (!user) {
    redirect("/marketing/login");
    throw new Error("Unauthorized");
  }
  if (options?.requireVerified !== false && !user.emailConfirmed) {
    redirect("/marketing/verify");
    throw new Error("Email not verified");
  }
  return user;
}

export async function markMarketingEmailVerified(userId: string) {
  const admin = createAdminClient();
  await admin.auth.admin.updateUserById(userId, {
    email_confirm: true,
  });
}
