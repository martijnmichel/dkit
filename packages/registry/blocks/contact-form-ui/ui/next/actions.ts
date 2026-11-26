"use server";

import { createDirectus, createItem, rest } from "@directus/sdk";
import { z } from "zod";
import { collections } from "@/lib/dkit/config";

const schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  message: z.string().min(1).max(5000),
});

export type ContactFormState = {
  ok: boolean;
  error?: string;
};

export async function submitContactForm(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const url = process.env.DIRECTUS_URL;
  if (!url) return { ok: false, error: "Missing DIRECTUS_URL" };

  try {
    const client = createDirectus(url).with(rest());
    await client.request(createItem(collections.form_submissions, parsed.data));
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Submission failed",
    };
  }
}
