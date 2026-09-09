import { redirect } from "next/navigation";
import { isCareerPublicEnabled } from "@/lib/site-settings/store";

/** Redirects away when admin has turned Career coach off for the public site. */
export async function requireCareerPublic(redirectTo = "/") {
  if (!(await isCareerPublicEnabled())) {
    redirect(redirectTo);
  }
}
