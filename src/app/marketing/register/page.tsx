import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MarketingAuthForm } from "@/components/marketing/marketing-auth-form";
import { getMarketingAuthUser } from "@/lib/marketing/auth";
import { requireMarketingPublic } from "@/lib/marketing/public";

export const metadata: Metadata = {
  title: "Register for Business marketing",
  robots: { index: false, follow: false },
};

export default async function MarketingRegisterPage() {
  await requireMarketingPublic();

  const user = await getMarketingAuthUser();
  if (user?.emailConfirmed) redirect("/marketing/app");
  if (user) redirect("/marketing/verify");

  return (
    <div className="flex flex-1 items-center justify-center px-5 py-16">
      <div className="w-full max-w-md rounded-[1.8rem] border border-white/12 bg-[#0c0c0c] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          Business marketing
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-white">
          Register your company
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Enter your company name, email and phone. We will verify the email
          before you can connect socials and set your ad schedule.
        </p>
        <div className="mt-8">
          <MarketingAuthForm mode="register" />
        </div>
      </div>
    </div>
  );
}
