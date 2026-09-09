import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOutCareer } from "@/app/career/actions";
import { CareerSetupForm } from "@/components/career/career-setup-form";
import { Container, Section } from "@/components/ui/section";
import {
  ensureCareerProfile,
  getCareerAuthUser,
} from "@/lib/career/auth";
import {
  focusLabel,
  listCareerSessionsForProfile,
} from "@/lib/career/store";
import { formatDateTime } from "@/lib/inbox/format";

export const metadata: Metadata = {
  title: "Career dashboard",
  robots: { index: false, follow: false },
};

export default async function CareerAppPage() {
  const user = await getCareerAuthUser();
  if (!user) redirect("/career/login");
  if (!user.emailConfirmed) redirect("/career/verify");

  const profile = await ensureCareerProfile(user);
  const sessions = await listCareerSessionsForProfile(profile.id);

  return (
    <Section className="pb-24 pt-10">
      <Container>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              Career coach
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              Hi {profile.name || "there"}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-white/60">
              Choose your African SA English coach voice, session length, and
              focus — then start a timed mock interview.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/career" className="text-white/55 hover:text-white">
              Career home
            </Link>
            <form action={signOutCareer}>
              <button type="submit" className="text-accent">
                Sign out
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <CareerSetupForm profile={profile} />

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Recent sessions</h2>
            {sessions.length === 0 ? (
              <p className="rounded-[1.4rem] border border-white/12 bg-[#0c0c0c] p-6 text-sm text-white/55">
                No sessions yet. Start your first timed practice when you are
                ready.
              </p>
            ) : (
              <div className="overflow-hidden rounded-[1.4rem] border border-white/12 bg-[#0c0c0c]">
                {sessions.map((session) => (
                  <Link
                    key={session.id}
                    href={`/career/session/${session.id}`}
                    className="block border-b border-white/8 px-4 py-4 last:border-b-0 transition hover:bg-white/[0.03]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-white">
                        {session.targetRole || "Practice session"}
                      </p>
                      <span className="text-xs uppercase tracking-wide text-white/45">
                        {session.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-white/60">
                      {focusLabel(session.focus)} · {session.voice} ·{" "}
                      {session.durationMinutes} min
                    </p>
                    <p className="mt-1 text-xs text-white/40">
                      {formatDateTime(session.createdAt)}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
