import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOutMarketing } from "@/app/marketing/actions";
import { MarketingPostsPanel } from "@/components/marketing/marketing-posts-panel";
import { MarketingSetupForm } from "@/components/marketing/marketing-setup-form";
import { Container, Section } from "@/components/ui/section";
import {
  ensureMarketingProfile,
  getMarketingAuthUser,
} from "@/lib/marketing/auth";
import { isSocialPublisherConfigured } from "@/lib/marketing/publish";
import {
  listMarketingPosts,
  listMarketingSocials,
} from "@/lib/marketing/store";

export const metadata: Metadata = {
  title: "Marketing dashboard",
  robots: { index: false, follow: false },
};

export default async function MarketingAppPage({
  searchParams,
}: {
  searchParams: Promise<{
    connected?: string;
    connect?: string;
    platform?: string;
  }>;
}) {
  const user = await getMarketingAuthUser();
  if (!user) redirect("/marketing/login");
  if (!user.emailConfirmed) redirect("/marketing/verify");

  const profile = await ensureMarketingProfile(user);
  const [socials, posts] = await Promise.all([
    listMarketingSocials(profile.id),
    listMarketingPosts(profile.id, { limit: 20 }),
  ]);
  const params = await searchParams;
  const publisherConfigured = isSocialPublisherConfigured();

  return (
    <Section className="pb-24 pt-12">
      <Container>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              Business marketing
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              {profile.company}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/60">
              Set your services, website and phone so every ad drives clients to
              contact you. Connect socials and choose how often AI should post.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/marketing" className="text-white/55 hover:text-white">
              Overview
            </Link>
            <form action={signOutMarketing}>
              <button type="submit" className="text-accent">
                Sign out
              </button>
            </form>
          </div>
        </div>

        {params.connected ? (
          <p
            role="status"
            className="mt-6 rounded-xl border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-accent"
          >
            Connected {params.connected}. Save setup to refresh your queue.
          </p>
        ) : null}
        {params.connect === "unavailable" ? (
          <p
            role="status"
            className="mt-6 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100"
          >
            {params.platform
              ? `${params.platform} connect is not available yet.`
              : "Social connect is not available yet."}{" "}
            You can still save the profile URL for the AI copy.
          </p>
        ) : null}

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.6rem] border border-white/12 bg-[#0c0c0c] p-5 sm:p-7">
            <h2 className="text-lg font-semibold text-white">Company setup</h2>
            <p className="mt-1 text-sm text-white/55">
              Ads always include your company name, services, website and phone.
            </p>
            <div className="mt-6">
              <MarketingSetupForm
                profile={profile}
                socials={socials}
                publisherConfigured={publisherConfigured}
              />
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-white/12 bg-[#0c0c0c] p-5 sm:p-7">
            <MarketingPostsPanel posts={posts} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
