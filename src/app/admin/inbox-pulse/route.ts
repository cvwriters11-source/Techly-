import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/session";
import { getInboxAlertPulse } from "@/lib/inbox/store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pulse = await getInboxAlertPulse();
    return NextResponse.json(pulse);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Inbox alerts could not be loaded.",
      },
      { status: 500 },
    );
  }
}
