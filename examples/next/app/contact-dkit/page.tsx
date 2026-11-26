import { Form, installed } from "@/components/dkit/contact-form";

export default function DkitContactFormPage() {
  if (!installed) {
    return <p>Form is not installed yet.</p>;
  }
  return (
    <main className="container py-16">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Contact</h1>
      <Form />
    </main>
  );
}
