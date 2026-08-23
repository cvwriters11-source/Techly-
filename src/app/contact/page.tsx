import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Request a consultation, send a project brief, or reach Techly by email, phone or WhatsApp.",
};

const details = [
  {
    icon: Mail,
    label: "Email",
    value: site.email,
    href: `mailto:${site.email}`,
  },
  {
    icon: Phone,
    label: "Phone",
    value: site.phoneDisplay,
    href: `tel:${site.phoneTel}`,
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: site.phoneDisplay,
    href: `https://wa.me/${site.whatsapp}`,
  },
  {
    icon: MapPin,
    label: "Office",
    value: site.location,
  },
  {
    icon: Clock,
    label: "Business hours",
    value: site.hours,
  },
];

export default function ContactPage() {
  return (
    <Section className="pb-28 pt-16">
      <Container>
        <SectionHeading
          align="left"
          eyebrow="Contact"
          title="Tell us what you want to build, fix or automate."
          description="New work and existing clients can request a consultation here. Choose the service that fits, share a short brief, and we will come back with a practical next step."
        />
        <div
          id="consult"
          className="mt-10 rounded-[1.8rem] border border-white/12 bg-[#0c0c0c] p-5 sm:p-8"
        >
          <ContactForm />
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {details.map((item) => {
            const Icon = item.icon;
            const content = (
              <>
                <Icon className="mt-0.5 h-4 w-4 text-accent" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm text-white">{item.value}</p>
                </div>
              </>
            );

            return item.href ? (
              <a
                key={item.label}
                href={item.href}
                className="flex gap-3 rounded-2xl border border-white/12 bg-[#0c0c0c] p-5 transition hover:border-accent/40"
              >
                {content}
              </a>
            ) : (
              <div
                key={item.label}
                className="flex gap-3 rounded-2xl border border-white/12 bg-[#0c0c0c] p-5"
              >
                {content}
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
