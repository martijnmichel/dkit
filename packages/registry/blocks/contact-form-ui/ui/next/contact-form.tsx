"use client";

import { useActionState } from "react";
import {
  submitContactForm,
  type ContactFormState,
} from "./actions";

const initial: ContactFormState = { ok: false };

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContactForm, initial);

  if (state.ok) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
        Thanks — we received your message.
      </div>
    );
  }

  return (
    <form action={action} className="mx-auto max-w-md space-y-4">
      <p className="text-sm text-stone-500 dark:text-stone-400">
        Messages are stored in your Directus inbox. Email notify is optional if
        Directus mail is configured.
      </p>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="message">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
        />
      </div>
      {state.error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900"
      >
        {pending ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
