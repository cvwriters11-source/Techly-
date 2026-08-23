"use server";

import { revalidatePath } from "next/cache";
import { saveTicket } from "@/lib/inbox/store";
import {
  allTicketProblems,
  contactMethods,
  ticketClientTypes,
  ticketUrgency,
} from "@/lib/site";

export type TicketState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
};

function isIn<T extends readonly string[]>(
  value: string,
  list: T,
): value is T[number] {
  return (list as readonly string[]).includes(value);
}

export async function submitTicket(
  _prev: TicketState,
  formData: FormData,
): Promise<TicketState> {
  const clientType = String(formData.get("clientType") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const problems = formData
    .getAll("problems")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const urgency = String(formData.get("urgency") ?? "").trim();
  const contactMethod = String(formData.get("contactMethod") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  const fieldErrors: Record<string, string> = {};

  if (!isIn(clientType, ticketClientTypes)) {
    fieldErrors.clientType = "Please tell us if you are a new or existing client.";
  }
  if (name.length < 2) fieldErrors.name = "Please enter your name.";
  if (company.length < 2) fieldErrors.company = "Please enter your company.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "Please enter a valid email address.";
  }
  if (phone.length < 7) fieldErrors.phone = "Please enter a phone number.";
  if (problems.length === 0) {
    fieldErrors.problems = "Please choose at least one problem.";
  } else if (problems.some((problem) => !allTicketProblems.includes(problem))) {
    fieldErrors.problems = "Please choose from the listed problems.";
  }
  if (!isIn(urgency, ticketUrgency)) {
    fieldErrors.urgency = "Please select how urgent this is.";
  }
  if (!isIn(contactMethod, contactMethods)) {
    fieldErrors.contactMethod = "Please choose a preferred contact method.";
  }
  if (description.length < 8) {
    fieldErrors.description = "Please add a short note so we can help faster.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message: "Please check the highlighted fields.",
      fieldErrors,
    };
  }

  try {
    await saveTicket({
      clientType,
      name,
      company,
      email,
      phone,
      problems,
      urgency,
      contactMethod,
      description,
    });
  } catch {
    return {
      ok: false,
      message: "We could not save this ticket. Please try again.",
    };
  }
  revalidatePath("/admin");
  revalidatePath("/admin/tickets");

  return {
    ok: true,
    message:
      "Ticket received. We will contact you shortly using your preferred method. New clients are welcome — no existing account is required.",
  };
}
