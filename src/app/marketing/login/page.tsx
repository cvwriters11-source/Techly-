import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MarketingAuthForm } from "@/components/marketing/marketing-auth-form";
import { getMarketingAuthUser } from "@/lib/marketing/auth";

export const metadata: Metadata = {
  title: "Business marketing log in",
  robots: { index: false, follow: false },
};

export default async function MarketingLoginPage() {
  const user = await getMarketingAuthUser();
  if (user?.emailConfirmed) redirect("/marketing/app");
  if (user) redirect("/marketing/verify");

  return (
    <div className="flex flex-1 items-center justify-center px-5 py-16">
      <div className="w-full max-w-md rounded-[1.8rem] border border-white/12 bg-[#0c0c0c] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          Business marketing
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-white">Log in</h1>
        <p className="mt-2 text-sm text-white/60">
          Access your AI ad schedule, social connections and company profile.
        </p>
        <div className="mt-8">
          <MarketingAuthForm mode="login" />
        </div>
      </div>
    </div>
  );
}
