import Link from "next/link";
import { Logo } from "@/components/logo";
import { Container } from "@/components/ui/section";
import { nav, serviceCategories, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <Container className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Logo compact />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            {site.tagline}
          </p>
        </div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            Company
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted transition hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            Services
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {serviceCategories.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted transition hover:text-foreground"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            Contact
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-foreground">
                {site.email}
              </a>
            </li>
            <li>
              <a href={`tel:${site.phoneTel}`} className="hover:text-foreground">
                {site.phoneDisplay}
              </a>
            </li>
            <li>{site.location}</li>
            <li>{site.hours}</li>
          </ul>
          <div className="mt-5 flex gap-4 text-sm">
            <a href={site.social.linkedin} className="text-muted hover:text-accent">
              LinkedIn
            </a>
            <a href={site.social.facebook} className="text-muted hover:text-accent">
              Facebook
            </a>
            <a href={site.social.instagram} className="text-muted hover:text-accent">
              Instagram
            </a>
          </div>
        </div>
      </Container>
      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-2 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p>Software development · IT support · Business automation</p>
        </Container>
      </div>
    </footer>
  );
}
