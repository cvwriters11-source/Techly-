import { NextResponse } from "next/server";
import { isEmailConfigured, sendEmail } from "@/lib/email";

function authorized(request: Request) {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!isEmailConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Email is not configured on this deployment." },
      { status: 500 },
    );
  }

  const to =
    process.env.ADMIN_NOTIFY_EMAIL?.trim() ||
    process.env.ADMIN_EMAIL?.trim() ||
    "";

  if (!to) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_EMAIL is not set." },
      { status: 500 },
    );
  }

  const stamp = new Date().toISOString();
  const result = await sendEmail({
    to,
    subject: `Techly SMTP test (${stamp})`,
    text: [
      "This is a production SMTP test from Techly on Vercel.",
      `Time: ${stamp}`,
      `Host: ${process.env.SMTP_HOST || "(none)"}`,
      `Port: ${process.env.SMTP_PORT || "(none)"}`,
    ].join("\n"),
    html: `<p>This is a production SMTP test from Techly on Vercel.</p><p><strong>Time:</strong> ${stamp}</p><p><strong>Host:</strong> ${process.env.SMTP_HOST || "(none)"}</p><p><strong>Port:</strong> ${process.env.SMTP_PORT || "(none)"}</p>`,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: result.error,
        host: process.env.SMTP_HOST || null,
        port: process.env.SMTP_PORT || null,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    to,
    host: process.env.SMTP_HOST || null,
    port: process.env.SMTP_PORT || null,
    at: stamp,
  });
}
