import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import {
  projectHostname,
  projectPreviewSrc,
  type ProjectRecord,
} from "@/lib/projects/store";

export function ProjectCard({
  project,
  compact = false,
}: {
  project: ProjectRecord;
  compact?: boolean;
}) {
  const preview = projectPreviewSrc(project);
  const host = projectHostname(project.url);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#111]">
      {preview ? (
        <a
          href={project.url}
          target="_blank"
          rel="noreferrer"
          className="block border-b border-white/10"
          aria-label={`${project.title} live site preview`}
        >
          <div className="flex items-center gap-1.5 bg-black/60 px-3 py-1.5">
            <span className="size-1.5 rounded-full bg-white/25" />
            <span className="size-1.5 rounded-full bg-white/25" />
            <span className="size-1.5 rounded-full bg-white/25" />
            <span className="ml-2 truncate text-[10px] text-white/40">
              {host}
            </span>
          </div>
          <div
            className={
              compact
                ? "relative aspect-[2.4/1] bg-black"
                : "relative aspect-[2/1] bg-black"
            }
          >
            {preview.startsWith("/") ? (
              <Image
                src={preview}
                alt={`${project.title} website`}
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              // External screenshot services are not always in next/image remotePatterns.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt={`${project.title} website`}
                className="size-full object-cover object-top"
              />
            )}
          </div>
        </a>
      ) : null}
      <div className={`flex flex-1 flex-col ${compact ? "p-5" : "p-6 sm:p-7"}`}>
        {compact ? (
          <h3 className="text-lg font-semibold text-white">{project.title}</h3>
        ) : (
          <h2 className="text-xl font-semibold text-white">{project.title}</h2>
        )}
        {project.summary ? (
          <p className="mt-3 flex-1 text-sm leading-relaxed text-white/70">
            {project.summary}
          </p>
        ) : (
          <p className="mt-3 flex-1 text-sm text-white/45">Live client project</p>
        )}
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
  );
}
