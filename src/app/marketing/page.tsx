import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, Megaphone, Share2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { requireMarketingPublic } from "@/lib/marketing/public";

export const metadata: Metadata = {
  title: "Business marketing",
  description:
    "Register your company, connect your social platforms, and let Techly AI write and schedule sales ads that drive calls to your website and phone.",
};

const steps = [
  {
    icon: ShieldCheck,
    title: "Register and verify",
    text: "Sign up with your company name, email and phone. We verify your email before the dashboard opens.",
  },
  {
    icon: Share2,
    title: "Connect socials",
    text: "Add your website, services and social profiles, then connect Facebook, Instagram, LinkedIn, X and more.",
  },
  {
    icon: CalendarClock,
    title: "Set your schedule",
    text: "Choose how often ads should go out — per day or per week. Pause or edit anytime.",
  },
  {
    icon: Megaphone,
    title: "AI posts for you",
    text: "Ads lead with your company name and services, always include your website and phone, and auto-post on schedule.",
  },
];

export default async function MarketingLandingPage() {
  await requireMarketingPublic();

  return (
    <Section className="pb-28 pt-16">
      <Container>
        <SectionHeading
          align="left"
          eyebrow="Business marketing"
          title="AI ads that drive sales for your company."
          description="Register once, connect your social platforms, and set how often you want posts. Techly writes sales-focused ads around your company name and services, then auto-posts them so clients can call or visit your website."
        />

        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/marketing/register" variant="solid">
            Register your company
          </Button>
          <Button href="/marketing/login" variant="ghost">
            Log in to dashboard
          </Button>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <article
                key={step.title}
                className="rounded-[1.4rem] border border-white/12 bg-[#0c0c0c] p-6"
              >
                <Icon className="size-5 text-accent" />
                <h2 className="mt-4 text-lg font-semibold text-white">
                  {step.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-white/65">
                  {step.text}
                </p>
              </article>
            );
          })}
        </div>

        <p className="mt-10 text-sm text-white/50">
          Already registered?{" "}
          <Link href="/marketing/login" className="text-accent">
            Open your marketing dashboard
          </Link>
          .
        </p>
      </Container>
    </Section>
  );
}
