import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CareerAuthForm } from "@/components/career/career-auth-form";
import { getCareerAuthUser } from "@/lib/career/auth";

export const metadata: Metadata = {
  title: "Career coach log in",
  robots: { index: false, follow: false },
};

export default async function CareerLoginPage() {
  const user = await getCareerAuthUser();
  if (user?.emailConfirmed) redirect("/career/app");
  if (user) redirect("/career/verify");

  return (
    <div className="flex flex-1 items-center justify-center px-5 py-16">
      <div className="w-full max-w-md rounded-[1.8rem] border border-white/12 bg-[#0c0c0c] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          Career coach
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-white">Log in</h1>
        <p className="mt-2 text-sm text-white/60">
          Access your mock interview sessions, voice preference, and coaching
          history.
        </p>
        <div className="mt-8">
          <CareerAuthForm mode="login" />
        </div>
      </div>
    </div>
  );
}
