export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="badge">Directus 11+ · Next.js App Router</p>
      <h1 className="mt-6 text-4xl font-semibold tracking-tight">
        Directus modules you own
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        One command installs schema, permissions, flows, and type-safe frontend
        blocks into your codebase — like shadcn, for Directus.
      </p>
      <div className="mt-8 flex gap-4">
        <a className="btn" href="/modules/">
          Browse modules
        </a>
        <a className="btn" href="https://github.com/martijnmichel/dkit" style={{ background: "transparent", color: "var(--fg)", border: "1px solid var(--border)" }}>
          GitHub
        </a>
      </div>
      <pre className="code mt-10">{`npx dkit init
npx dkit add blog --seed`}</pre>
      <section className="mt-16 grid grid-3">
        {[
          ["Schema + access", "Collections, relations, and public/admin policies applied to your instance."],
          ["Services", "Optional flows and seed data so the UI renders immediately."],
          ["Owned UI", "Unbundled React/TSX written into your repo — customize freely."],
        ].map(([title, body]) => (
          <div key={title} className="card">
            <h2 className="font-medium">{title}</h2>
            <p className="mt-2 text-sm text-muted">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
