import { redirect } from "next/navigation";
import { createUserClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type ClientUser = {
  id: string;
  email: string;
  name: string;
  company: string;
};

export async function getClientUser(): Promise<ClientUser | null> {
  try {
    const supabase = await createUserClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user?.email) return null;

    const metadata = user.user_metadata ?? {};
    return {
      id: user.id,
      email: user.email,
      name: typeof metadata.name === "string" ? metadata.name : "",
      company: typeof metadata.company === "string" ? metadata.company : "",
    };
  } catch {
    return null;
  }
}

export async function requireClientUser() {
  const user = await getClientUser();
  if (!user) redirect("/login");
  return user;
}

export async function linkTicketsToUser(user: Pick<ClientUser, "id" | "email">) {
  const supabase = createAdminClient();
  await supabase
    .from("tickets")
    .update({ user_id: user.id })
    .is("user_id", null)
    .ilike("email", user.email);
}
