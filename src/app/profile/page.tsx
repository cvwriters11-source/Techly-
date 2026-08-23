import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { listPublicProjects } from "@/lib/projects/store";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Profile",
  description: `Live projects and completed work from ${site.name} — software, websites and systems we have built for clients.`,
};

export default async function ProfilePage() {
  const projects = await listPublicProjects();

  return (
    <>
      <Section className="overflow-hidden pb-10 pt-16">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
        <Container className="relative">
          <Reveal>
            <SectionHeading
              eyebrow="Our Profile"
              title="Work we have shipped for clients."
              description="A selection of live projects — websites, platforms and systems built around how each business actually operates."
            />
          </Reveal>
        </Container>
      </Section>

      <Section className="pt-0 pb-28">
        <Container>
          {projects.length === 0 ? (
            <p className="rounded-[1.8rem] border border-white/10 bg-[#111] px-6 py-10 text-center text-white/65">
              New project links will appear here as they go live.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {projects.map((project, index) => (
                <Reveal key={project.id} delay={index * 60}>
                  <article className="flex h-full flex-col overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#111]">
                    {project.imageUrl ? (
                      <div className="relative aspect-[16/9] bg-black">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={project.imageUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                      </div>
                    ) : null}
                    <div className="flex flex-1 flex-col p-6 sm:p-7">
                      <h2 className="text-xl font-semibold text-white">
                        {project.title}
                      </h2>
                      {project.summary ? (
                        <p className="mt-3 text-sm leading-relaxed text-white/70">
                          {project.summary}
                        </p>
                      ) : null}
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-white"
                      >
                        Visit live site
                        <ArrowUpRight className="size-4" />
                      </a>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}

          <div className="mt-12 rounded-[2rem] border border-white/10 bg-card px-8 py-10 sm:px-12">
            <h2 className="font-display text-2xl text-foreground sm:text-3xl">
              Want a project like these for your business?
            </h2>
            <p className="mt-3 max-w-xl text-muted">
              Tell us what you need to build, automate or replace — we will
              come back with a practical path.
            </p>
            <div className="mt-7">
              <Button href="/contact">Request a Consultation</Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
