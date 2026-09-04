"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminCredentialsMatch, emailsMatch } from "@/lib/admin/auth";
import { createAdminSession } from "@/lib/admin/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createUserClient } from "@/lib/supabase/server";
import { getClientUser, linkTicketsToUser } from "@/lib/client-auth";

export type AuthFormState = {
  ok: boolean;
  message: string;
};

function safeFrom(value: string) {
  return value.startsWith("/account") || value === "/ticket" ? value : "/account";
}

export async function signUpClient(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const from = safeFrom(String(formData.get("from") ?? "/account"));

  if (name.length < 2) {
    return { ok: false, message: "Please enter your name." };
  }
  if (company.length < 2) {
    return { ok: false, message: "Please enter your company." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }
  if (password.length < 8) {
    return { ok: false, message: "Password must be at least 8 characters." };
  }

  if (process.env.ADMIN_EMAIL && emailsMatch(email, process.env.ADMIN_EMAIL)) {
    return {
      ok: false,
      message: "An account with this email already exists. Log in instead.",
    };
  }

  const admin = createAdminClient();
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, company },
  });

  if (created.error) {
    const duplicate =
      created.error.message.toLowerCase().includes("already") ||
      created.error.message.toLowerCase().includes("registered");
    return {
      ok: false,
      message: duplicate
        ? "An account with this email already exists. Log in instead."
        : created.error.message,
    };
  }

  const supabase = await createUserClient();
  const signedIn = await supabase.auth.signInWithPassword({ email, password });
  if (signedIn.error || !signedIn.data.user) {
    return {
      ok: false,
      message: "Account created, but we could not sign you in. Please log in.",
    };
  }

  await linkTicketsToUser({ id: signedIn.data.user.id, email });
  redirect(from);
}

export async function signInClient(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const from = safeFrom(String(formData.get("from") ?? "/account"));

  if (adminCredentialsMatch(email, password)) {
    await createAdminSession();
    redirect("/admin");
  }

  const supabase = await createUserClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user?.email) {
    return { ok: false, message: "Incorrect email or password." };
  }

  await linkTicketsToUser({ id: data.user.id, email: data.user.email });
  redirect(from);
}

export async function signOutClient() {
  const supabase = await createUserClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function submitClientFollowUp(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const user = await getClientUser();
  if (!user) {
    return { ok: false, message: "Please log in to send a follow-up." };
  }

  const ticketId = String(formData.get("ticketId") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  if (message.length < 8) {
    return {
      ok: false,
      message: "Please add a short note so we know how to help.",
    };
  }

  const { addClientFollowUp } = await import("@/lib/inbox/store");
  const ticket = await addClientFollowUp(ticketId, user.id, user.email, message);
  if (!ticket) {
    return { ok: false, message: "This ticket could not be updated." };
  }

  revalidatePath("/account");
  revalidatePath(`/account/${ticketId}`);
  revalidatePath("/admin");
  revalidatePath(`/admin/tickets/${ticketId}`);

  return { ok: true, message: "Follow-up sent. We will pick this up shortly." };
}
