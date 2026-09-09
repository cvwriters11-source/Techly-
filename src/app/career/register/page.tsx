import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CareerAuthForm } from "@/components/career/career-auth-form";
import { getCareerAuthUser } from "@/lib/career/auth";
import { requireCareerPublic } from "@/lib/career/public";

export const metadata: Metadata = {
  title: "Register for Career coach",
  robots: { index: false, follow: false },
};

export default async function CareerRegisterPage() {
  await requireCareerPublic();

  const user = await getCareerAuthUser();
  if (user?.emailConfirmed) redirect("/career/app");
  if (user) redirect("/career/verify");

  return (
    <div className="flex flex-1 items-center justify-center px-5 py-16">
      <div className="w-full max-w-md rounded-[1.8rem] border border-white/12 bg-[#0c0c0c] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          Career coach
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-white">
          Register as a candidate
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Create your account first. After email verification you can choose
          voice, session length, and start a mock interview.
        </p>
        <div className="mt-8">
          <CareerAuthForm mode="register" />
        </div>
      </div>
    </div>
  );
}
