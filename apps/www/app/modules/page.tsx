import { getRegistry } from "@/lib/registry";

export default function ModulesPage() {
  const registry = getRegistry();
  const modules = registry.items.filter((i) => i.type === "dkit:module");

  return (
    <div className="px-6 py-10 lg:px-10">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        Modules
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Each module applies schema and access to your Directus instance, then
        drops matching UI into your app. Install with{" "}
        <code className="font-mono text-sm">npx dkit add &lt;id&gt;</code>.
      </p>

      <div className="mt-8 space-y-1 md:hidden">
        {modules.map((m) => (
          <a
            key={m.id}
            href={`/modules/${m.id}/`}
            className="flex flex-col rounded-lg border border-border px-4 py-3 no-underline hover:bg-muted/50 hover:no-underline"
          >
            <span className="font-medium text-foreground">{m.title}</span>
            <span className="mt-0.5 text-sm text-muted-foreground">
              {m.description}
            </span>
            <span className="mt-2 font-mono text-xs text-muted-foreground">
              {m.id}
            </span>
          </a>
        ))}
      </div>

      <div className="mt-10 hidden grid-cols-2 gap-4 md:grid xl:grid-cols-3">
        {modules.map((m) => (
          <a
            key={m.id}
            href={`/modules/${m.id}/`}
            className="rounded-xl border border-border bg-card p-5 text-card-foreground no-underline shadow-sm transition-colors hover:border-primary/40 hover:no-underline"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-medium">{m.title}</h2>
              <span className="badge">v{m.version}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{m.description}</p>
            <p className="mt-4 font-mono text-sm text-muted-foreground">{m.id}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
