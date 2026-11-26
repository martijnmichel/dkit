"use server";

import { createItem, getDirectus } from "@/lib/dkit/client";
import { z } from "zod";
import { collections } from "@/lib/dkit/config";
import type {
  ContactFormState,
  FormSubmission,
  FormSubmissionInput,
} from "./types";

export type {
  ContactFormState,
  FormSubmission,
  FormSubmissionInput,
} from "./types";

const schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  message: z.string().min(1).max(5000),
});

/** Create a submission (inbox). Prefer submitContactForm from UI. */
export async function createSubmission(
  input: FormSubmissionInput,
): Promise<{ ok: true; id?: string } | { ok: false; error: string }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const client = getDirectus();
  if (!client) return { ok: false, error: "Missing DIRECTUS_URL" };

  try {
    const row = await client.request(
      createItem(collections.form_submissions, parsed.data),
    );
    return { ok: true, id: (row as FormSubmission)?.id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Submission failed",
    };
  }
}

export async function submitContactForm(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const result = await createSubmission({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
  });
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true };
}
