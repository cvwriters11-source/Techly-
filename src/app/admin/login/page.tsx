import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  const nextPath = from?.startsWith("/admin") ? from : "/admin";

  return (
    <div className="flex flex-1 items-center justify-center px-5 py-16">
      <div className="w-full max-w-md rounded-[1.8rem] border border-white/12 bg-[#0c0c0c] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          Techly Admin
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-white">
          Sign in to the dashboard
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Tickets and Contact us messages land here with the full details the
          client submitted.
        </p>
        <div className="mt-8">
          <AdminLoginForm from={nextPath} />
        </div>
      </div>
    </div>
  );
}
