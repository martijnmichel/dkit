import { getRegistry } from "@/lib/registry";

export default function ModulesPage() {
  const registry = getRegistry();
  const modules = registry.items.filter((i) => i.type === "dkit:module");

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Modules</h1>
      <p className="mt-2 text-muted">
        Each module ships schema + access (+ optional flows). Default UI blocks install with{" "}
        <code className="font-mono">dkit add &lt;id&gt;</code>.
      </p>
      <div className="mt-10 grid grid-3">
        {modules.map((m) => (
          <a key={m.id} href={`/modules/${m.id}/`} className="card">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-medium">{m.title}</h2>
              <span className="badge">v{m.version}</span>
            </div>
            <p className="mt-2 text-sm text-muted">{m.description}</p>
            <p className="mt-4 font-mono text-sm">{m.id}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
