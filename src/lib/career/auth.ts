import { createAdminClient } from "@/lib/supabase/admin";
import { createUserClient } from "@/lib/supabase/server";

export type CareerUser = {
  id: string;
  email: string;
  name: string;
  phone: string;
  emailConfirmed: boolean;
};

export async function getCareerAuthUser(): Promise<CareerUser | null> {
  try {
    const supabase = await createUserClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user?.email) return null;

    const metadata = user.user_metadata ?? {};
    if (metadata.kind !== "career") return null;

    return {
      id: user.id,
      email: user.email,
      name: typeof metadata.name === "string" ? metadata.name : "",
      phone: typeof metadata.phone === "string" ? metadata.phone : "",
      emailConfirmed: Boolean(user.email_confirmed_at),
    };
  } catch {
    return null;
  }
}

export async function ensureCareerProfile(user: CareerUser) {
  const { getOrCreateCareerProfile } = await import("@/lib/career/store");
  return getOrCreateCareerProfile({
    userId: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
  });
}

export async function requireCareerUser(options?: {
  requireVerified?: boolean;
}) {
  const { redirect } = await import("next/navigation");
  const user = await getCareerAuthUser();
  if (!user) {
    redirect("/career/login");
    throw new Error("Unauthorized");
  }
  if (options?.requireVerified !== false && !user.emailConfirmed) {
    redirect("/career/verify");
    throw new Error("Email not verified");
  }
  return user;
}

export async function markCareerEmailVerified(userId: string) {
  const admin = createAdminClient();
  await admin.auth.admin.updateUserById(userId, {
    email_confirm: true,
  });
}
