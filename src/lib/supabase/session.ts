import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabasePublishableKey, supabaseUrl } from "@/lib/supabase/env";

export async function refreshUserSession(request: NextRequest) {
  try {
    let response = NextResponse.next({ request });

    const supabase = createServerClient(supabaseUrl(), supabasePublishableKey(), {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
          Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
        },
      },
    });

    const { data } = await supabase.auth.getClaims();
    return { response, signedIn: Boolean(data?.claims) };
  } catch {
    return { response: NextResponse.next({ request }), signedIn: false };
  }
}
