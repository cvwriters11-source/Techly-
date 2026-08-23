"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/session";
import {
  deleteProject,
  normalizeHttpUrl,
  saveProject,
  updateProject,
} from "@/lib/projects/store";

export type ProjectFormState = {
  ok: boolean;
  message: string;
};

function readProjectFields(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const sortRaw = String(formData.get("sortOrder") ?? "0").trim();
  const sortOrder = Number.parseInt(sortRaw, 10);

  if (title.length < 2) {
    return { error: "Please enter the project name." };
  }

  let url = "";
  let imageUrl = "";
  try {
    url = normalizeHttpUrl(String(formData.get("url") ?? ""));
    const imageRaw = String(formData.get("imageUrl") ?? "").trim();
    imageUrl = imageRaw ? normalizeHttpUrl(imageRaw) : "";
  } catch {
    return { error: "Enter a valid website link, including the domain." };
  }

  if (!url) {
    return { error: "Please add the live project link." };
  }

  return {
    values: {
      title,
      url,
      summary,
      imageUrl,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    },
  };
}

function revalidateProjectPages() {
  revalidatePath("/admin/projects");
  revalidatePath("/profile");
  revalidatePath("/");
}

export async function createProjectAction(
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireAdmin();
  const parsed = readProjectFields(formData);
  if ("error" in parsed) {
    return { ok: false, message: parsed.error ?? "Please check the form." };
  }

  try {
    await saveProject(parsed.values);
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "The project could not be saved.",
    };
  }

  revalidateProjectPages();
  redirect("/admin/projects");
}

export async function updateProjectAction(
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireAdmin();
  const id = String(formData.get("recordId") ?? "");
  const parsed = readProjectFields(formData);
  if ("error" in parsed) {
    return { ok: false, message: parsed.error ?? "Please check the form." };
  }

  try {
    const updated = await updateProject(id, parsed.values);
    if (!updated) {
      return { ok: false, message: "This project could not be updated." };
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "The project could not be updated.",
    };
  }

  revalidateProjectPages();
  revalidatePath(`/admin/projects/${id}`);
  return { ok: true, message: "Project updated." };
}

export async function deleteProjectAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("recordId") ?? "");
  await deleteProject(id);
  revalidateProjectPages();
  redirect("/admin/projects");
}
