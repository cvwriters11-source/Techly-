import type { Metadata } from "next";
import { ProjectCard } from "@/components/project-card";
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
      <Section className="overflow-hidden pb-4 pt-16 sm:pb-6">
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

      <Section className="pt-0 pb-28 sm:pt-0">
        <Container>
          {projects.length === 0 ? (
            <p className="rounded-[1.8rem] border border-white/10 bg-[#111] px-6 py-10 text-center text-white/65">
              New project links will appear here as they go live.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {projects.map((project, index) => (
                <Reveal key={project.id} delay={index * 60}>
                  <ProjectCard project={project} />
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
