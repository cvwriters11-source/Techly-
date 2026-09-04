import type { Metadata } from "next";
import { TicketForm } from "@/components/ticket-form";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { getClientUser } from "@/lib/client-auth";

export const metadata: Metadata = {
  title: "Log a Ticket",
  description:
    "Log a software development or IT support ticket. New and existing clients can choose the problem they need help with.",
};

export default async function TicketPage() {
  const client = await getClientUser();

  return (
    <Section className="pt-6 pb-28 sm:pt-8 sm:pb-28">
      <Container>
        <SectionHeading
          align="left"
          eyebrow="Log a Ticket"
          title="What can we help you with?"
          description="New clients and existing clients can log a ticket here. Choose every problem that applies — software, IT support, hosting or automation — and we will get back to you."
        />
        <div className="mt-10 rounded-[1.8rem] border border-white/12 bg-[#0c0c0c] p-5 sm:p-8">
          <TicketForm
            defaults={
              client
                ? {
                    name: client.name,
                    company: client.company,
                    email: client.email,
                    clientType: "I am an existing client",
                  }
                : undefined
            }
          />
        </div>
      </Container>
    </Section>
  );
}
