import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin/auth";
import { refreshUserSession } from "@/lib/supabase/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { response, signedIn } = await refreshUserSession(request);

  if (pathname.startsWith("/account") && !signedIn) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value)) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
