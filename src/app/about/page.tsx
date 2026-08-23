import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { industries, site, whyChoose } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description: `Who ${site.name} is, what we believe, and why businesses trust us to build and support their technology.`,
};

export default function AboutPage() {
  return (
    <>
      <Section className="overflow-hidden pb-12 pt-16">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
        <Container className="relative">
          <Reveal>
            <SectionHeading
              eyebrow="About us"
              title="A technology company built around the way businesses actually operate."
              description="Techly is a software development and IT support partner for organisations across South Africa. We combine custom software, remote support and practical onsite help so teams stay productive and systems stay reliable."
            />
          </Reveal>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <article className="h-full rounded-3xl border border-white/8 bg-card p-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                Mission
              </p>
              <h2 className="mt-4 font-display text-2xl text-foreground">
                Help businesses operate smarter through software, automation and dependable IT.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                We exist to replace friction with systems: custom software that
                fits the work, automation that removes repetitive tasks, and
                support that keeps everything running.
              </p>
            </article>
          </Reveal>
          <Reveal delay={80}>
            <article className="h-full rounded-3xl border border-white/8 bg-card p-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                Vision
              </p>
              <h2 className="mt-4 font-display text-2xl text-foreground">
                Be the long-term technology partner growing companies can rely on.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                We want every client to have a clear digital foundation —
                connected tools, protected data, and a team that understands
                both the code and the business behind it.
              </p>
            </article>
          </Reveal>
        </Container>
      </Section>

      <Section className="border-y border-white/10 bg-black">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="What makes us different"
              title="Experience that sits between software, operations and support."
              description="We are not a traditional IT repair shop, and we are not a distant agency that disappears after launch. Techly is built to stay useful after the first release."
            />
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {whyChoose.map((reason, index) => (
              <Reveal key={reason.title} delay={index * 60}>
                <article className="rounded-3xl border border-white/8 bg-white/[0.02] p-6">
                  <h3 className="font-display text-xl text-foreground">
                    {reason.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {reason.text}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <SectionHeading
              eyebrow="Experience & expertise"
              title="Practical delivery across software, infrastructure and automation."
              description="Our work covers custom web and mobile applications, business platforms, integrations, Microsoft 365 environments, cybersecurity basics, and the workflows that sit between them."
            />
          </Reveal>
          <Reveal delay={80}>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                Industries we serve
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {industries.map((industry) => (
                  <span
                    key={industry}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-foreground"
                  >
                    {industry}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section className="pt-0 pb-28">
        <Container>
          <div className="rounded-[2rem] border border-white/10 bg-card px-8 py-12 sm:px-12">
            <h2 className="font-display text-3xl text-foreground">
              Let’s talk about what your business needs next.
            </h2>
            <p className="mt-4 max-w-xl text-muted">
              Whether you are starting a new system or replacing something that
              no longer fits, we will help you find a practical path forward.
            </p>
            <div className="mt-8">
              <Button href="/contact">Request a Consultation</Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
