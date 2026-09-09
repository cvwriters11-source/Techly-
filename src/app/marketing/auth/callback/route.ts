import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabasePublishableKey, supabaseUrl } from "@/lib/supabase/env";
import { ensureMarketingProfile } from "@/lib/marketing/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = "/marketing/app";

  if (!code) {
    return NextResponse.redirect(new URL("/marketing/verify", url.origin));
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
          // Route handler cookie writes can fail in edge cases; session refresh covers it.
        }
      },
    },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user?.email) {
    return NextResponse.redirect(new URL("/marketing/verify", url.origin));
  }

  const metadata = data.user.user_metadata ?? {};
  if (metadata.kind === "marketing") {
    await ensureMarketingProfile({
      id: data.user.id,
      email: data.user.email,
      name: typeof metadata.name === "string" ? metadata.name : "",
      company: typeof metadata.company === "string" ? metadata.company : "",
      phone: typeof metadata.phone === "string" ? metadata.phone : "",
      emailConfirmed: Boolean(data.user.email_confirmed_at),
    });
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
