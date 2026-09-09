import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CareerSessionRoom } from "@/components/career/career-session-room";
import { Container, Section } from "@/components/ui/section";
import { getCareerAuthUser } from "@/lib/career/auth";
import { startCareerCoachTurn } from "@/lib/career/coach";
import {
  getCareerProfileByUserId,
  getCareerSession,
  listCareerMessages,
} from "@/lib/career/store";

export const metadata: Metadata = {
  title: "Career session",
  robots: { index: false, follow: false },
};

export default async function CareerSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCareerAuthUser();
  if (!user) redirect("/career/login");
  if (!user.emailConfirmed) redirect("/career/verify");

  const profile = await getCareerProfileByUserId(user.id);
  const session = await getCareerSession(id);
  if (!profile || !session || session.profileId !== profile.id) {
    notFound();
  }

  const messages = await listCareerMessages(session.id);
  if (
    session.status === "active" &&
    !messages.some((message) => message.role === "coach")
  ) {
    await startCareerCoachTurn(session.id);
  }
  const transcript = await listCareerMessages(session.id);

  return (
    <Section className="pb-20 pt-6 sm:pb-24 sm:pt-10">
      <Container>
        <CareerSessionRoom session={session} initialMessages={transcript} />
      </Container>
    </Section>
  );
}
