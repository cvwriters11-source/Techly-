import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabasePublishableKey, supabaseUrl } from "@/lib/supabase/env";
import { ensureCareerProfile } from "@/lib/career/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = "/career/app";

  if (!code) {
    return NextResponse.redirect(new URL("/career/verify", url.origin));
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl(), supabasePublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Session refresh covers edge cookie write failures.
        }
      },
    },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user?.email) {
    return NextResponse.redirect(new URL("/career/verify", url.origin));
  }

  const metadata = data.user.user_metadata ?? {};
  if (metadata.kind === "career") {
    await ensureCareerProfile({
      id: data.user.id,
      email: data.user.email,
      name: typeof metadata.name === "string" ? metadata.name : "",
      phone: typeof metadata.phone === "string" ? metadata.phone : "",
      emailConfirmed: Boolean(data.user.email_confirmed_at),
    });
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
