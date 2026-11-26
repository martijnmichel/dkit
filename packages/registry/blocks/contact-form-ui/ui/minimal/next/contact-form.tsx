"use client";

import { useActionState } from "react";
import {
  submitContactForm,
  type ContactFormState,
} from "@/lib/dkit/contact-form";

const initial: ContactFormState = { ok: false };

/** Minimal kit — semantic form markup only. */
export function ContactForm() {
  const [state, action, pending] = useActionState(submitContactForm, initial);

  if (state.ok) {
    return <p>Thanks — we received your message.</p>;
  }

  return (
    <form action={action}>
      <p>Send a message and we&apos;ll get back to you.</p>
      <p>
        <label htmlFor="name">Name</label>
        <br />
        <input id="name" name="name" required />
      </p>
      <p>
        <label htmlFor="email">Email</label>
        <br />
        <input id="email" name="email" type="email" required />
      </p>
      <p>
        <label htmlFor="message">Message</label>
        <br />
        <textarea id="message" name="message" required rows={5} />
      </p>
      {state.error ? <p>{state.error}</p> : null}
      <p>
        <button type="submit" disabled={pending}>
          {pending ? "Sending…" : "Send"}
        </button>
      </p>
    </form>
  );
}
