import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import {
  cctvCameraTypes,
  contactCameraHref,
  contactServiceHref,
  serviceCategories,
} from "@/lib/site";

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
  const showCameraTypes = category.slug === "cctv-installations";

  return (
    <>
      <Section className="overflow-hidden pt-2 pb-8 sm:pt-2 sm:pb-8">
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

      <Section className="pt-0 pb-28 sm:pt-0 sm:pb-28">
        <Container>
          {showCameraTypes ? (
            <>
              <Reveal>
                <div className="mb-8 max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                    Camera types
                  </p>
                  <h2 className="mt-3 font-display text-2xl text-foreground sm:text-3xl">
                    Choose the right CCTV for your site
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                    From TPZ solar cameras for remote sites to IP network
                    cameras indoors and outdoors — we install what fits your
                    premises, not a one-size kit.
                  </p>
                </div>
              </Reveal>
              <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2">
                {cctvCameraTypes.map((camera, index) => (
                  <Reveal key={camera.name} delay={index * 40} className="h-full">
                    <article
                      className={
                        camera.name === "TPZ solar cameras"
                          ? "flex h-full flex-col overflow-hidden rounded-3xl border border-accent/35 bg-accent/10"
                          : "flex h-full flex-col overflow-hidden rounded-3xl border border-white/8 bg-card"
                      }
                    >
                      <div
                        className={
                          camera.gallery && camera.gallery.length > 0
                            ? "relative aspect-[4/3] w-full overflow-hidden bg-white"
                            : "relative aspect-[16/10] w-full overflow-hidden bg-black/40"
                        }
                      >
                        {camera.gallery && camera.gallery.length > 0 ? (
                          <div className="flex h-full snap-x snap-mandatory overflow-x-auto">
                            {camera.gallery.map((shot) => (
                              <div
                                key={shot.src}
                                className="relative h-full w-full min-w-full shrink-0 snap-center p-4 sm:p-5"
                              >
                                <div className="relative h-full w-full">
                                  <Image
                                    src={shot.src}
                                    alt={shot.alt}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className="object-contain"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <Image
                            src={camera.image}
                            alt={camera.imageAlt}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-6">
                        <p className="font-mono text-[11px] leading-none text-accent">
                          {String(index + 1).padStart(2, "0")}
                        </p>
                        <h2 className="mt-4 font-display text-xl leading-snug text-foreground">
                          {camera.name}
                        </h2>
                        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                          {camera.description}
                        </p>
                        <div className="mt-6">
                          <Button
                            href={contactCameraHref(camera.name)}
                            variant="solid"
                            className="w-full"
                          >
                            Order now
                          </Button>
                        </div>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {category.items.map((item, index) => (
                <Reveal key={item} delay={index * 40} className="h-full">
                  <article className="flex h-full flex-col rounded-3xl border border-white/8 bg-card p-6">
                    <p className="font-mono text-[11px] leading-none text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h2 className="mt-5 font-display text-xl leading-snug text-foreground">
                      {item}
                    </h2>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                      Scoped, built and supported as part of a wider{" "}
                      {category.title.toLowerCase()} engagement — not a one-off
                      ticket with no follow-through.
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          )}

          <div className="mt-10 rounded-[2rem] border border-white/10 bg-[#141414] px-8 py-10">
            <h2 className="font-display text-2xl text-foreground sm:text-3xl">
              {showCameraTypes
                ? "Need CCTV installed?"
                : "Need this for your business?"}
            </h2>
            <p className="mt-3 max-w-xl text-muted">
              {showCameraTypes
                ? "Tell us about your site — indoor, outdoor, solar or remote — and we will recommend the right camera mix with recording and phone viewing."
                : "Share the problem you are trying to solve and we will recommend a practical next step — build, support, automate, or a mix of all three."}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button href={contactServiceHref(category.title)}>
                Get Started
              </Button>
              <Button href="/services">All services</Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
