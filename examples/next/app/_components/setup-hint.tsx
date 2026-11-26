export function SetupHint() {
  return (
    <main style={{ maxWidth: 640, margin: "48px auto", padding: 24 }}>
      <h1 style={{ fontSize: 24 }}>Blog UI not installed yet</h1>
      <p style={{ color: "#666" }}>
        From the monorepo root (with Directus up and{" "}
        <code>DIRECTUS_TOKEN</code> set):
      </p>
      <pre
        style={{
          background: "#111",
          color: "#f5f5f5",
          padding: 16,
          borderRadius: 8,
          overflow: "auto",
        }}
      >
        {`pnpm example:next:setup
# or alternate templates:
pnpm --filter @dkit/example-next dkit:add-blog-cards`}
      </pre>
    </main>
  );
}
