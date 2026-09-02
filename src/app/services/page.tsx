import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/section";
import { serviceCategories } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Software development, IT support, business automation, hosting and CCTV camera installations from Techly.",
};

export default function ServicesPage() {
  return (
    <>
      <Section className="overflow-hidden pt-16 pb-8 sm:pt-16 sm:pb-8">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
        <Container className="relative">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <div className="flex flex-wrap justify-center gap-2">
                {serviceCategories.map((category) => (
                  <Link
                    key={category.href}
                    href={category.href}
                    className="whitespace-nowrap rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-[13px] font-medium text-white transition hover:border-accent/70 hover:bg-white/10 md:text-sm"
                  >
                    {category.title}
                  </Link>
                ))}
              </div>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.6rem] lg:leading-tight">
                Every service we offer.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-white/80 sm:text-lg">
                Software development, websites, IT support, Microsoft 365,
                hosting, workflow automation, and CCTV camera installations —
                the full Techly range, in one place.
              </p>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section className="pt-0 pb-28 sm:pt-0 sm:pb-28">
        <Container className="space-y-5">
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
