import { redirect } from "next/navigation";
import { isMarketingPublicEnabled } from "@/lib/site-settings/store";

/** Redirects away when admin has turned Business marketing off for the public site. */
export async function requireMarketingPublic(redirectTo = "/") {
  if (!(await isMarketingPublicEnabled())) {
    redirect(redirectTo);
  }
}
