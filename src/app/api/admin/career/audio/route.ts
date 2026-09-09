import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/session";
import {
  downloadCareerMessageAudio,
  getCareerMessage,
  getCareerSession,
} from "@/lib/career/store";
import { synthesizeCareerSpeech } from "@/lib/career/tts";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const messageId = url.searchParams.get("messageId")?.trim() ?? "";
  if (!messageId) {
    return NextResponse.json({ error: "messageId is required." }, { status: 400 });
  }

  const message = await getCareerMessage(messageId);
  if (!message) {
    return NextResponse.json({ error: "Message not found." }, { status: 404 });
  }

  if (message.audioPath) {
    const blob = await downloadCareerMessageAudio(message.audioPath);
    const bytes = await blob.arrayBuffer();
    const type = blob.type || "audio/webm";
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": type,
        "Cache-Control": "private, max-age=120",
      },
    });
  }

  if (message.role === "coach") {
    const session = await getCareerSession(message.sessionId);
    try {
      const audio = await synthesizeCareerSpeech({
        text: message.text,
        voice: session?.voice ?? "woman",
      });
      return new NextResponse(audio, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "private, max-age=60",
        },
      });
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Could not synthesize coach audio.",
        },
        { status: 503 },
      );
    }
  }

  return NextResponse.json(
    { error: "No recording was saved for this candidate answer." },
    { status: 404 },
  );
}
