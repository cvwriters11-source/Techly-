import { NextResponse } from "next/server";
import { getCareerAuthUser } from "@/lib/career/auth";
import {
  getCareerProfileByUserId,
  getCareerSession,
  careerVoices,
  type CareerVoice,
} from "@/lib/career/store";
import { synthesizeCareerSpeech } from "@/lib/career/tts";

export async function POST(request: Request) {
  const user = await getCareerAuthUser();
  if (!user?.emailConfirmed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { text?: string; voice?: string; sessionId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const text = String(body.text ?? "").trim();
  const voiceRaw = String(body.voice ?? "woman");
  const voice = careerVoices.includes(voiceRaw as CareerVoice)
    ? (voiceRaw as CareerVoice)
    : "woman";

  if (text.length < 1) {
    return NextResponse.json({ error: "Text is required." }, { status: 400 });
  }

  if (body.sessionId) {
    const profile = await getCareerProfileByUserId(user.id);
    const session = await getCareerSession(body.sessionId);
    if (!profile || !session || session.profileId !== profile.id) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }
  }

  try {
    const audio = await synthesizeCareerSpeech({ text, voice });
    return new NextResponse(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not synthesize speech.",
      },
      { status: 503 },
    );
  }
}
