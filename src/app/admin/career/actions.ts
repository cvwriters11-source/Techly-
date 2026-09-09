"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/session";
import { setCareerPublicEnabled } from "@/lib/site-settings/store";

export type CareerFeatureState = {
  ok: boolean;
  message: string;
};

export async function setCareerFeatureAction(
  _prev: CareerFeatureState,
  formData: FormData,
): Promise<CareerFeatureState> {
  await requireAdmin();

  const enabled = formData.get("enabled") === "on";

  try {
    await setCareerPublicEnabled(enabled);
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Could not update Career coach visibility.",
    };
  }

  revalidatePath("/admin/career");
  revalidatePath("/", "layout");
  revalidatePath("/career");

  return {
    ok: true,
    message: enabled
      ? "Career coach is live on the site."
      : "Career coach is hidden from the public site.",
  };
}
