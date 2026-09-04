"use server";

import { revalidatePath } from "next/cache";
import { notifyAdminInbox } from "@/lib/email";
import { saveContact } from "@/lib/inbox/store";
import {
  budgetRanges,
  contactMethods,
  serviceOptions,
} from "@/lib/site";

export type ContactState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
};

function isIn<T extends readonly string[]>(
  value: string,
  list: T,
): value is T[number] {
  return list.includes(value);
}

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = String(formData.get("name") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const service = String(formData.get("service") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const budget = String(formData.get("budget") ?? "").trim();
  const contactMethod = String(formData.get("contactMethod") ?? "").trim();

  const fieldErrors: Record<string, string> = {};

  if (name.length < 2) fieldErrors.name = "Please enter your name.";
  if (company.length < 2) fieldErrors.company = "Please enter your company.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "Please enter a valid email address.";
  }
  if (phone.length < 7) fieldErrors.phone = "Please enter a phone number.";
  if (!isIn(service, serviceOptions)) {
    fieldErrors.service = "Please select a service.";
  }
  if (description.length < 12) {
    fieldErrors.description = "Please tell us a little more about the project.";
  }
  if (!isIn(budget, budgetRanges)) {
    fieldErrors.budget = "Please select a budget range.";
  }
  if (!isIn(contactMethod, contactMethods)) {
    fieldErrors.contactMethod = "Please choose a preferred contact method.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message: "Please check the highlighted fields.",
      fieldErrors,
    };
  }

  try {
    const contact = await saveContact({
      name,
      company,
      email,
      phone,
      service,
      description,
      budget,
      contactMethod,
    });
    try {
      await notifyAdminInbox({
        kind: "contact",
        recordId: contact.id,
        name: contact.name,
        company: contact.company,
        email: contact.email,
        phone: contact.phone,
        summary: contact.service,
        details: contact.description,
      });
    } catch {
      // The request is saved even if the admin email cannot be sent.
    }
  } catch {
    return {
      ok: false,
      message: "We could not save this request. Please try again.",
    };
  }
  revalidatePath("/admin");
  revalidatePath("/admin/contacts");

  return {
    ok: true,
    message:
      "Thank you. Your consultation request has been received. We will be in touch shortly.",
  };
}
