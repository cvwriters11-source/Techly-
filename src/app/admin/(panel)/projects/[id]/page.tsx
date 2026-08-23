import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  deleteProjectAction,
  updateProjectAction,
} from "@/app/admin/projects/actions";
import { ProjectForm } from "@/components/admin/project-form";
import { getProject } from "@/lib/projects/store";

export const metadata: Metadata = {
  title: "Edit project",
  robots: { index: false, follow: false },
};

export default async function AdminProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/projects" className="text-sm text-accent">
          ← All projects
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-white">{project.title}</h1>
        <p className="mt-2 text-sm break-all text-white/50">{project.id}</p>
      </div>

      <ProjectForm
        action={updateProjectAction}
        project={project}
        submitLabel="Save project"
      />

      <form
        action={deleteProjectAction}
        className="rounded-[1.4rem] border border-white/12 bg-[#111] p-5"
      >
        <input type="hidden" name="recordId" value={project.id} />
        <p className="text-sm text-white/55">
          Remove this project from Our Profile.
        </p>
        <button
          type="submit"
          className="mt-4 text-sm text-red-300 transition hover:text-red-200"
        >
          Delete project
        </button>
      </form>
    </div>
  );
}
