import { Check } from "lucide-react";
import Image from "next/image";
import { HeroSlider } from "@/components/hero-slider";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { listPublicProjects } from "@/lib/projects/store";
import { homeServices, principles, whyChoose } from "@/lib/site";

export default async function HomePage() {
  const projects = await listPublicProjects();
  const featured = projects.slice(0, 3);

  return (
    <>
      <HeroSlider />

      <Section>
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="About Us"
              title="Why Choose Techly?"
              description="Techly provides managed IT support, custom software, hardware and cloud solutions for businesses across South Africa. Our team combines reliable remote services with practical onsite assistance, helping organisations improve security, efficiency and long-term scalability."
            />
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {whyChoose.map((item, index) => {
              const featured = index === 1;
              return (
                <Reveal key={item.title} delay={index * 80}>
                  <article
                    className={
                      featured
                        ? "flex h-full flex-col rounded-[1.6rem] bg-linear-to-b from-[#7dffe9] to-[#12c8b0] p-7 text-center text-black"
                        : "flex h-full flex-col rounded-[1.6rem] border border-white/20 bg-black p-7 text-center"
                    }
                  >
                    <h3
                      className={`text-lg font-semibold ${featured ? "text-black" : "text-white"}`}
                    >
                      {item.title}
                    </h3>
                    <p
                      className={`mt-4 text-sm leading-relaxed ${featured ? "text-black/75" : "text-white/75"}`}
                    >
                      {item.text}
                    </p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section id="services" className="pt-8">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Our Services"
              title="Software Development & IT Support Services"
              description="At Techly, we bring together the best of technology to create smarter, more resilient businesses. From IT infrastructure and software development to cloud services, we deliver integrated systems that drive efficiency, reduce costs, and unlock new opportunities for growth."
            />
          </Reveal>
          <p className="mx-auto mt-5 max-w-3xl text-center text-white/75">
            Our holistic approach ensures your business is protected and prepared for the future.
          </p>

          <div className="mt-16 space-y-10">
            {homeServices.map((service, index) => (
              <Reveal key={service.title} delay={40}>
                <article
                  className={`grid items-stretch gap-6 lg:grid-cols-2 ${
                    index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  <div className="relative min-h-[280px] overflow-hidden rounded-[1.8rem] lg:min-h-[420px]">
                    <Image
                      src={service.image}
                      alt={service.imageAlt}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 50vw, 100vw"
                    />
                  </div>
                  <div className="rounded-[1.8rem] border border-white/15 bg-[#141414] p-7 sm:p-9">
                    <h3 className="text-2xl font-semibold leading-snug text-white sm:text-[1.7rem]">
                      {service.title}
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-white/75">
                      {service.text}
                    </p>
                    <ul className="mt-6 space-y-3">
                      {service.items.map((item) => (
                        <li
                          key={item}
                          className="flex gap-3 text-sm leading-relaxed text-white/90"
                        >
                          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-black">
                            <Check className="size-3.5" strokeWidth={3} />
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Our Approach"
              title="Best practices for customer satisfaction"
            />
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {principles.map((item, index) => (
              <Reveal key={item.title} delay={index * 70}>
                <article className="h-full rounded-[1.6rem] border border-white/15 bg-[#111] p-7 text-center">
                  <h3 className="text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-white/70">
                    {item.text}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {featured.length > 0 ? (
        <Section>
          <Container>
            <Reveal>
              <SectionHeading
                eyebrow="Our Profile"
                title="Recent work we have shipped."
                description="Live projects for clients — websites, platforms and systems built around how each business actually operates."
              />
            </Reveal>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {featured.map((project, index) => (
                <Reveal key={project.id} delay={index * 70}>
                  <article className="flex h-full flex-col rounded-[1.6rem] border border-white/15 bg-[#111] p-7">
                    <h3 className="text-lg font-semibold text-white">
                      {project.title}
                    </h3>
                    {project.summary ? (
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-white/70">
                        {project.summary}
                      </p>
                    ) : (
                      <p className="mt-3 flex-1 text-sm text-white/45">
                        Live client project
                      </p>
                    )}
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 text-sm font-medium text-accent hover:text-white"
                    >
                      Visit live site
                    </a>
                  </article>
                </Reveal>
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <Button href="/profile">View Our Profile</Button>
            </div>
          </Container>
        </Section>
      ) : null}

      <Section className="pb-28">
        <Container>
          <Reveal>
            <div className="text-center">
              <SectionHeading
                eyebrow="Get In Touch"
                title="How can we help you"
                description="Need onsite IT support in Gauteng or remote technical assistance anywhere in South Africa? Contact Techly for practical guidance, responsive support and a solution tailored to your business."
              />
              <div className="mt-8 flex justify-center">
                <Button href="/contact">Reach out today</Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
