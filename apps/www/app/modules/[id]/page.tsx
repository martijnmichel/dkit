import { getModuleMeta, getRegistry } from "@/lib/registry";
import { notFound } from "next/navigation";
import { ModuleTabs } from "./tabs";

export function generateStaticParams() {
  return getRegistry()
    .items.filter((i) => i.type === "dkit:module")
    .map((i) => ({ id: i.id }));
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const meta = getModuleMeta(id);
  if (!meta || meta.item.type !== "dkit:module") notFound();

  const schema = meta.schema as {
    format?: string;
    collections?: Array<{ collection: string; fields?: unknown[] }>;
  } | undefined;
  const access = meta.access as {
    policies?: Array<{ name: string; description?: string }>;
    permissions?: Array<{ collection: string; action: string }>;
  } | undefined;
  const flows = meta.flows as { flows?: Array<{ name: string; description?: string }> } | undefined;

  const collections =
    schema?.collections?.map((c) => c.collection) ??
    ((meta.manifest.collections as string[]) ?? []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="badge">dkit:module</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">{meta.item.title}</h1>
      <p className="mt-2 text-muted">{meta.item.description}</p>

      <pre className="code mt-8">{`npx dkit add ${id}`}</pre>
      <p className="mt-2 text-sm text-muted">
        Schema-only: <code className="font-mono">npx dkit add {id} --schema-only</code>
        {" · "}
        With seed: <code className="font-mono">npx dkit add {id} --seed</code>
      </p>

      <div className="mt-10">
        <ModuleTabs
          preview={
            <div className="card space-y-4">
              <h2 className="font-medium">Preview (fixtures)</h2>
              <p className="text-sm text-muted">
                Interactive live Directus previews can point at your own instance later.
                Below is what this module installs conceptually.
              </p>
              <ul className="space-y-2 text-sm">
                {collections.map((c) => (
                  <li key={c}>
                    <span className="font-mono">{c}</span>
                  </li>
                ))}
              </ul>
              {meta.item.defaultBlocks?.length ? (
                <p className="text-sm text-muted">
                  Default blocks: {meta.item.defaultBlocks.join(", ")}
                </p>
              ) : null}
            </div>
          }
          transparency={
            <div className="space-y-6">
              <section className="card">
                <h2 className="font-medium">Collections</h2>
                <ul className="mt-4 space-y-2 text-sm">
                  {(schema?.collections ?? []).map((c) => (
                    <li key={c.collection}>
                      <strong className="font-mono">{c.collection}</strong>
                      <span className="text-muted">
                        {" "}
                        · {(c.fields as unknown[] | undefined)?.length ?? 0} fields
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
              <section className="card">
                <h2 className="font-medium">Policies</h2>
                <ul className="mt-4 space-y-2 text-sm">
                  {(access?.policies ?? []).map((p) => (
                    <li key={p.name}>
                      <strong>{p.name}</strong>
                      {p.description ? (
                        <div className="text-muted">{p.description}</div>
                      ) : null}
                    </li>
                  ))}
                </ul>
                <ul className="mt-4 space-y-1 text-sm text-muted">
                  {(access?.permissions ?? []).map((p, i) => (
                    <li key={i} className="font-mono">
                      {p.action} → {p.collection}
                    </li>
                  ))}
                </ul>
              </section>
              {(flows?.flows?.length ?? 0) > 0 ? (
                <section className="card">
                  <h2 className="font-medium">Flows</h2>
                  <ul className="mt-4 space-y-2 text-sm">
                    {flows!.flows!.map((f) => (
                      <li key={f.name}>
                        <strong>{f.name}</strong>
                        {f.description ? (
                          <div className="text-muted">{f.description}</div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
              <p className="text-sm text-muted">
                Requires Directus 11+ (best on 12.2+). Back up or use a staging instance before{" "}
                <code className="font-mono">dkit add</code>.
              </p>
            </div>
          }
        />
      </div>
    </div>
  );
}
