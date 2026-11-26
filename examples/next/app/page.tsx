export default function HomePage() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontSize: 32, margin: 0 }}>Next.js example</h1>
      <p style={{ color: "#666", marginTop: 12 }}>
        Use the repo scripts to install / clear dkit modules against local Directus.
      </p>
      <pre
        style={{
          marginTop: 24,
          padding: 16,
          background: "#111",
          color: "#f5f5f5",
          borderRadius: 8,
          overflow: "auto",
          fontSize: 13,
        }}
      >{`# from repo root
pnpm directus:up
export DIRECTUS_TOKEN=<static-admin-token>

pnpm example:next:setup     # init + add blog --seed
pnpm --filter @dkit/example-next dev

pnpm example:next:clear     # remove generated dkit files
pnpm example:next:reset     # clear + re-add blog`}</pre>
      <p style={{ marginTop: 24 }}>
        <a href="/blog">Open /blog</a>
      </p>
    </main>
  );
}
