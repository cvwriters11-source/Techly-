import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOutMarketing } from "@/app/marketing/actions";
import { ResendVerificationForm } from "@/components/marketing/resend-verification-form";
import { getMarketingAuthUser } from "@/lib/marketing/auth";

export const metadata: Metadata = {
  title: "Verify your email",
  robots: { index: false, follow: false },
};

export default async function MarketingVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email: emailParam } = await searchParams;
  const user = await getMarketingAuthUser();
  if (user?.emailConfirmed) redirect("/marketing/app");

  const email = user?.email || emailParam?.trim().toLowerCase() || "";
  if (!email) redirect("/marketing/login");

  return (
    <div className="flex flex-1 items-center justify-center px-5 py-16">
      <div className="w-full max-w-md rounded-[1.8rem] border border-white/12 bg-[#0c0c0c] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          Email verification
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-white">
          Confirm your email
        </h1>
        <p className="mt-2 text-sm text-white/60">
          {user?.company ? `${user.company} is almost ready. ` : null}
          Verify {email} before connecting social platforms and scheduling ads.
          After you confirm, log in to open the dashboard.
        </p>
        <div className="mt-8">
          {user ? (
            <ResendVerificationForm email={email} />
          ) : (
            <div className="space-y-4">
              <p className="rounded-xl border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-accent">
                Check your inbox for the verification link sent to {email}.
              </p>
              <Link
                href="/marketing/login"
                className="inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-black"
              >
                Log in after verifying
              </Link>
            </div>
          )}
        </div>
        <div className="mt-6 flex items-center justify-between text-sm">
          <Link href="/marketing" className="text-white/55 hover:text-white">
            ← Back
          </Link>
          {user ? (
            <form action={signOutMarketing}>
              <button type="submit" className="text-accent">
                Sign out
              </button>
            </form>
          ) : (
            <Link href="/marketing/login" className="text-accent">
              Log in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
