import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { steps } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our Approach",
  description:
    "A simple five-step process: discover, plan, design and develop, test and deploy, then support and improve.",
};

export default function ApproachPage() {
  return (
    <>
      <Section className="overflow-hidden pt-16 pb-8 sm:pt-16 sm:pb-8">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
        <Container className="relative">
          <Reveal>
            <SectionHeading
              eyebrow="Our approach"
              title="Five steps. No mystery. No disappearing after launch."
              description="Every engagement follows the same disciplined path — so you always know where the work is, what happens next, and who owns the outcome."
            />
          </Reveal>
        </Container>
      </Section>

      <Section className="pt-0 pb-28 sm:pt-0 sm:pb-28">
        <Container className="space-y-5">
          {steps.map((step, index) => (
            <Reveal key={step.number} delay={index * 70}>
              <article className="grid gap-6 rounded-[2rem] border border-white/8 bg-card p-7 md:grid-cols-[140px_1fr] md:items-center md:p-10">
                <p className="font-display text-5xl font-semibold text-accent/80">
                  {step.number}
                </p>
                <div>
                  <h2 className="font-display text-2xl text-foreground sm:text-3xl">
                    {step.title}
                  </h2>
                  <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
                    {step.text}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}

          <div className="pt-10">
            <Button href="/contact">Request a Consultation</Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
