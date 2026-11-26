"use client";

import { useActionState } from "react";
import {
  submitContactForm,
  type ContactFormState,
} from "@/lib/dkit/contact-form";

const initial: ContactFormState = { ok: false };

/** Styled with shadcn theme tokens — inherits your app theme (Next shadcn/ui). */
export function ContactForm() {
  const [state, action, pending] = useActionState(submitContactForm, initial);

  if (state.ok) {
    return (
      <div className="rounded-lg border border-border bg-muted/40 p-6 text-foreground">
        Thanks — we received your message.
      </div>
    );
  }

  return (
    <form action={action} className="mx-auto max-w-md space-y-4">
      <p className="text-sm text-muted-foreground">
        Messages are stored in your Directus inbox. Email notify is optional if
        Directus mail is configured.
      </p>
      <div>
        <label
          className="mb-1 block text-sm font-medium text-foreground"
          htmlFor="name"
        >
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      <div>
        <label
          className="mb-1 block text-sm font-medium text-foreground"
          htmlFor="email"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      <div>
        <label
          className="mb-1 block text-sm font-medium text-foreground"
          htmlFor="message"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
