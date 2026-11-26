export type FormSubmission = {
  id: string;
  status: "new" | "read" | "archived";
  name: string;
  email: string;
  message: string;
  created_at?: string | null;
};

export type FormSubmissionInput = {
  name: string;
  email: string;
  message: string;
};

export type ContactFormState = {
  ok: boolean;
  error?: string;
};

/** Directory preview — mocked success (no Directus). */
export async function createSubmission(
  _input: FormSubmissionInput,
): Promise<{ ok: true; id?: string } | { ok: false; error: string }> {
  return { ok: true, id: "preview" };
}

export async function submitContactForm(
  _prev: ContactFormState,
  _formData: FormData,
): Promise<ContactFormState> {
  return { ok: true };
}
