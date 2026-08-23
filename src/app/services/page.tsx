import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { serviceCategories } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Custom software development, IT support and business automation — organised so you can find the right starting point quickly.",
};

export default function ServicesPage() {
  return (
    <>
      <Section className="overflow-hidden pb-10 pt-16">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
        <Container className="relative">
          <Reveal>
            <SectionHeading
              eyebrow="Services"
              title="Clear categories. Practical outcomes."
              description="Explore the work we do most often — from custom platforms and integrations to helpdesk support, Microsoft 365 and workflow automation."
            />
          </Reveal>
        </Container>
      </Section>

      <Section className="pt-0 pb-28">
        <Container className="space-y-6">
          {serviceCategories.map((category, index) => (
            <Reveal key={category.href} delay={index * 70}>
              <article className="overflow-hidden rounded-[2rem] border border-white/8 bg-card">
                <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
                  <div className="border-b border-white/8 p-8 lg:border-b-0 lg:border-r">
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                      {category.eyebrow}
                    </p>
                    <h2 className="mt-4 font-display text-3xl text-foreground">
                      {category.title}
                    </h2>
                    <p className="mt-4 text-sm leading-relaxed text-muted">
                      {category.description}
                    </p>
                    <Link
                      href={category.href}
                      className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent"
                    >
                      Explore {category.title}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <ul className="grid gap-px bg-white/6 sm:grid-cols-2">
                    {category.items.map((item) => (
                      <li
                        key={item}
                        className="bg-[#0a1020] px-6 py-5 text-sm text-foreground"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}

          <div className="pt-8 text-center">
            <Button href="/contact">Request a Quote</Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
