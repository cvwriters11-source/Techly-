import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOutCareer } from "@/app/career/actions";
import { CareerResendVerificationForm } from "@/components/career/career-resend-verification-form";
import { getCareerAuthUser } from "@/lib/career/auth";

export const metadata: Metadata = {
  title: "Verify your email",
  robots: { index: false, follow: false },
};

export default async function CareerVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email: emailParam } = await searchParams;
  const user = await getCareerAuthUser();
  if (user?.emailConfirmed) redirect("/career/app");

  const email = user?.email || emailParam?.trim().toLowerCase() || "";
  if (!email) redirect("/career/login");

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
          Verify {email} before starting a timed coaching session. After you
          confirm, log in to open the dashboard.
        </p>
        <div className="mt-8">
          {user ? (
            <CareerResendVerificationForm email={email} />
          ) : (
            <div className="space-y-4">
              <p className="rounded-xl border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-accent">
                Check your inbox for the verification link sent to {email}.
              </p>
              <Link
                href="/career/login"
                className="inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-black"
              >
                Log in after verifying
              </Link>
            </div>
          )}
        </div>
        <div className="mt-6 flex items-center justify-between text-sm">
          <Link href="/career" className="text-white/55 hover:text-white">
            ← Back
          </Link>
          {user ? (
            <form action={signOutCareer}>
              <button type="submit" className="text-accent">
                Sign out
              </button>
            </form>
          ) : (
            <Link href="/career/login" className="text-accent">
              Log in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
