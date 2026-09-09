import type { Metadata } from "next";
import Link from "next/link";
import { Clock3, Mic2, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { requireCareerPublic } from "@/lib/career/public";

export const metadata: Metadata = {
  title: "Career coach",
  description:
    "Register for interactive mock interviews with African South African English voices. Choose man or woman coach and 20, 30, or 60 minutes.",
};

const steps = [
  {
    icon: ShieldCheck,
    title: "Register and verify",
    text: "Create your candidate account with email and phone. Verify your email before any session starts.",
  },
  {
    icon: UserRound,
    title: "Pick voice and focus",
    text: "Choose a man or woman African SA English coach, your target role, and interview, job-hunt, or career-growth focus.",
  },
  {
    icon: Clock3,
    title: "Choose your time",
    text: "Book a timed session of 20, 30, or 60 minutes — the coach stays with you until the clock ends.",
  },
  {
    icon: Mic2,
    title: "Practise out loud",
    text: "The coach asks questions by voice. Answer with your microphone or type — then get feedback and the next question.",
  },
];

export default async function CareerLandingPage() {
  await requireCareerPublic();

  return (
    <Section className="pb-28 pt-16">
      <Container>
        <SectionHeading
          align="left"
          eyebrow="Career coach"
          title="Interview practice with an African voice coach."
          description="Prepare for interviews, sharpen job-hunt techniques, and build career confidence in a timed mock session. Register first, pick man or woman SA English voice, choose 20, 30 or 60 minutes, then practise out loud."
        />

        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/career/register" variant="solid">
            Register to start
          </Button>
          <Button href="/career/login" variant="ghost">
            Log in
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
          <Link href="/career/login" className="text-accent">
            Open your career dashboard
          </Link>
          .
        </p>
      </Container>
    </Section>
  );
}
