"use server";

import { revalidatePath } from "next/cache";
import { getClientUser } from "@/lib/client-auth";
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
  accountLink?: boolean;
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
  } else if (problems.some((problem) => !isIn(problem, allTicketProblems))) {
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

  const client = await getClientUser();
  const ticketEmail = client?.email ?? email;

  try {
    await saveTicket({
      clientType: client ? "I am an existing client" : clientType,
      name: client?.name || name,
      company: client?.company || company,
      email: ticketEmail,
      phone,
      problems,
      urgency,
      contactMethod,
      description,
      userId: client?.id ?? null,
    });
  } catch {
    return {
      ok: false,
      message: "We could not save this ticket. Please try again.",
    };
  }
  revalidatePath("/admin");
  revalidatePath("/admin/tickets");
  revalidatePath("/account");

  return {
    ok: true,
    accountLink: Boolean(client),
    message: client
      ? "Ticket received. Track it and send a follow-up from My tickets."
      : "Ticket received. We will contact you shortly using your preferred method. Create a client account to follow up later.",
  };
}
