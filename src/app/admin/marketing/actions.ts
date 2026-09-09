"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/session";
import { setMarketingPublicEnabled } from "@/lib/site-settings/store";

export type MarketingFeatureState = {
  ok: boolean;
  message: string;
};

export async function setMarketingFeatureAction(
  _prev: MarketingFeatureState,
  formData: FormData,
): Promise<MarketingFeatureState> {
  await requireAdmin();

  const enabled = formData.get("enabled") === "on";

  try {
    await setMarketingPublicEnabled(enabled);
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Could not update Business marketing visibility.",
    };
  }

  revalidatePath("/admin/marketing");
  revalidatePath("/", "layout");
  revalidatePath("/marketing");

  return {
    ok: true,
    message: enabled
      ? "Business marketing is live on the site."
      : "Business marketing is hidden from the public site.",
  };
}
