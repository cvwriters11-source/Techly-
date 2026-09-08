"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/session";
import {
  deleteSiteMessage,
  saveSiteMessage,
  siteMessageKinds,
  updateSiteMessage,
  type SiteMessageKind,
} from "@/lib/site-messages/store";

export type SiteMessageFormState = {
  ok: boolean;
  message: string;
};

function readMessageFields(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const kindRaw = String(formData.get("kind") ?? "promotion").trim();
  const sortRaw = String(formData.get("sortOrder") ?? "0").trim();
  const sortOrder = Number.parseInt(sortRaw, 10);
  const active = formData.get("active") === "on";
  const kind = siteMessageKinds.includes(kindRaw as SiteMessageKind)
    ? (kindRaw as SiteMessageKind)
    : null;

  if (!kind) {
    return { error: "Choose promotion or warning." };
  }
  if (title.length < 4) {
    return { error: "Please enter a short headline." };
  }
  if (body.length < 12) {
    return { error: "Please enter the message clients will read." };
  }

  return {
    values: {
      kind,
      title,
      body,
      active,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    },
  };
}

function revalidateMessagePages() {
  revalidatePath("/admin/messages");
  revalidatePath("/", "layout");
}

export async function createSiteMessageAction(
  _prev: SiteMessageFormState,
  formData: FormData,
): Promise<SiteMessageFormState> {
  await requireAdmin();
  const parsed = readMessageFields(formData);
  if ("error" in parsed) {
    return { ok: false, message: parsed.error ?? "Please check the form." };
  }

  try {
    await saveSiteMessage(parsed.values);
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "The message could not be saved.",
    };
  }

  revalidateMessagePages();
  redirect("/admin/messages");
}

export async function updateSiteMessageAction(
  _prev: SiteMessageFormState,
  formData: FormData,
): Promise<SiteMessageFormState> {
  await requireAdmin();
  const id = String(formData.get("recordId") ?? "");
  const parsed = readMessageFields(formData);
  if ("error" in parsed) {
    return { ok: false, message: parsed.error ?? "Please check the form." };
  }

  try {
    const updated = await updateSiteMessage(id, parsed.values);
    if (!updated) {
      return { ok: false, message: "This message could not be updated." };
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "The message could not be updated.",
    };
  }

  revalidateMessagePages();
  revalidatePath(`/admin/messages/${id}`);
  return { ok: true, message: "Message updated." };
}

export async function deleteSiteMessageAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("recordId") ?? "");
  await deleteSiteMessage(id);
  revalidateMessagePages();
  redirect("/admin/messages");
}
