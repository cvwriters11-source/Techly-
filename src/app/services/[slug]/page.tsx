import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { serviceCategories } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return serviceCategories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = serviceCategories.find((item) => item.slug === slug);
  if (!category) return { title: "Service" };
  return {
    title: category.title,
    description: category.summary,
  };
}

export default async function ServiceCategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = serviceCategories.find((item) => item.slug === slug);
  if (!category) notFound();

  return (
    <>
      <Section className="overflow-hidden pb-10 pt-16">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
        <Container className="relative">
          <Reveal>
            <SectionHeading
              eyebrow={category.eyebrow}
              title={category.title}
              description={category.description}
            />
          </Reveal>
        </Container>
      </Section>

      <Section className="pt-0 pb-28">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {category.items.map((item, index) => (
              <Reveal key={item} delay={index * 40}>
                <article className="h-full rounded-3xl border border-white/8 bg-card p-6">
                  <p className="font-mono text-[11px] text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 className="mt-4 font-display text-xl text-foreground">
                    {item}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    Scoped, built and supported as part of a wider {category.title.toLowerCase()} engagement — not a one-off ticket with no follow-through.
                  </p>
                </article>
              </Reveal>
            ))}
          </div>

          <div className="mt-12 rounded-[2rem] border border-white/10 bg-[#141414] px-8 py-10">
            <h2 className="font-display text-2xl text-foreground sm:text-3xl">
              Need this for your business?
            </h2>
            <p className="mt-3 max-w-xl text-muted">
              Share the problem you are trying to solve and we will recommend a
              practical next step — build, support, automate, or a mix of all three.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button href="/contact">Get Started</Button>
              <Button href="/services">
                All services
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
