import { NextResponse } from "next/server";
import { getCareerAuthUser } from "@/lib/career/auth";
import {
  getCareerMessage,
  getCareerProfileByUserId,
  getCareerSession,
  uploadCareerMessageAudio,
} from "@/lib/career/store";

function extensionFor(type: string) {
  if (type.includes("mpeg") || type.includes("mp3")) return "mp3";
  if (type.includes("mp4") || type.includes("m4a")) return "m4a";
  if (type.includes("ogg")) return "ogg";
  if (type.includes("wav")) return "wav";
  return "webm";
}

export async function POST(request: Request) {
  const user = await getCareerAuthUser();
  if (!user?.emailConfirmed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const messageId = String(form.get("messageId") ?? "").trim();
  const sessionId = String(form.get("sessionId") ?? "").trim();
  const file = form.get("audio");

  if (!messageId || !sessionId || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing audio upload." }, { status: 400 });
  }

  if (file.size < 64 || file.size > 12_000_000) {
    return NextResponse.json({ error: "Audio size is invalid." }, { status: 400 });
  }

  const profile = await getCareerProfileByUserId(user.id);
  const session = await getCareerSession(sessionId);
  const message = await getCareerMessage(messageId);
  if (
    !profile ||
    !session ||
    !message ||
    session.profileId !== profile.id ||
    message.sessionId !== session.id
  ) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  const contentType = file.type || "audio/webm";
  const bytes = await file.arrayBuffer();
  const updated = await uploadCareerMessageAudio({
    sessionId,
    messageId,
    bytes,
    contentType,
    extension: extensionFor(contentType),
  });

  return NextResponse.json({ ok: true, message: updated });
}
