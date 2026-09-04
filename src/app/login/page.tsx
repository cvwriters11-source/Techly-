import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ClientAuthForm } from "@/components/auth/client-auth-form";
import { getClientUser } from "@/lib/client-auth";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  if (await getClientUser()) redirect("/account");
  const { from } = await searchParams;
  const nextPath =
    from?.startsWith("/account") || from === "/ticket" ? from : "/account";

  return (
    <div className="flex flex-1 items-center justify-center px-5 py-16">
      <div className="w-full max-w-md rounded-[1.8rem] border border-white/12 bg-[#0c0c0c] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          Sign in
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-white">Log in</h1>
        <p className="mt-2 text-sm text-white/60">
          Clients can log tickets and follow up on work. Admin can use the same
          form to open the dashboard.
        </p>
        <div className="mt-8">
          <ClientAuthForm mode="login" from={nextPath} />
        </div>
      </div>
    </div>
  );
}
