"use client";

import { useActionState } from "react";
import {
  submitContactForm,
  type ContactFormState,
} from "@/lib/dkit/contact-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initial: ContactFormState = { ok: false };

/** Uses your project's shadcn/ui components. */
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
    <form action={action} className="max-w-md space-y-4">
      <p className="text-sm text-muted-foreground">
        Send a message and we&apos;ll get back to you.
      </p>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" required rows={5} />
      </div>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send"}
      </Button>
    </form>
  );
}
