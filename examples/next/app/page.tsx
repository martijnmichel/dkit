export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-4xl tracking-tight text-stone-900">
        Next.js example
      </h1>
      <p className="mt-3 text-stone-500">
        Use the repo scripts to install / clear dkit modules against local
        Directus.
      </p>
      <pre className="mt-8 overflow-auto rounded-2xl bg-stone-900 p-5 text-sm leading-relaxed text-stone-100">{`# from repo root
pnpm directus:up
export DIRECTUS_TOKEN=<static-admin-token>

pnpm example:next:setup
pnpm --filter @dkit/example-next dev

pnpm example:next:clear
pnpm example:next:reset`}</pre>
      <p className="mt-8">
        <a
          href="/blog"
          className="text-sm font-medium text-teal-800 underline-offset-4 hover:underline"
        >
          Open /blog →
        </a>
      </p>
    </main>
  );
}
