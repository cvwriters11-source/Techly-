import type { Metadata } from "next";
import Link from "next/link";
import { createProjectAction } from "@/app/admin/projects/actions";
import { ProjectForm } from "@/components/admin/project-form";
import { listProjects } from "@/lib/projects/store";

export const metadata: Metadata = {
  title: "Projects",
  robots: { index: false, follow: false },
};

export default async function AdminProjectsPage() {
  const projects = await listProjects();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          Our Profile
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Projects</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/60">
          Add live links for work you have completed. They appear on the public
          site under Our Profile.
        </p>
      </div>

      <ProjectForm action={createProjectAction} submitLabel="Add project" />

      {projects.length === 0 ? (
        <p className="rounded-[1.4rem] border border-white/12 bg-[#0c0c0c] p-8 text-sm text-white/55">
          No projects yet. Add a name and live link above.
        </p>
      ) : (
        <div className="overflow-hidden rounded-[1.4rem] border border-white/12 bg-[#0c0c0c]">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/admin/projects/${project.id}`}
              className="block border-b border-white/8 px-4 py-4 last:border-b-0 transition hover:bg-white/[0.03]"
            >
              <p className="font-medium break-words text-white">{project.title}</p>
              <p className="mt-1 text-sm break-all text-accent/90">{project.url}</p>
              {project.summary ? (
                <p className="mt-2 text-sm leading-snug break-words text-white/65">
                  {project.summary}
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
