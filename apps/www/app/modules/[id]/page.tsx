import { ModuleBlockPreviews } from "@/components/previews/module-previews";
import { SchemaReference } from "@/components/schema-reference";
import {
  getBlocksForModule,
  getModuleMeta,
  getRegistry,
} from "@/lib/registry";
import type { RestSchemaDoc } from "@/lib/schema-docs";
import { notFound } from "next/navigation";

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

  const schema = meta.schema as RestSchemaDoc | undefined;
  const access = meta.access as {
    policies?: Array<{ name: string; description?: string }>;
    permissions?: Array<{
      collection: string;
      action: string;
      fields?: string[] | null;
    }>;
  } | undefined;
  const flows = meta.flows as {
    flows?: Array<{ name: string; description?: string; status?: string }>;
  } | undefined;

  const blocks = getBlocksForModule(id);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="badge">dkit:module</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        {meta.item.title}
      </h1>
      <p className="mt-2 text-muted">{meta.item.description}</p>

      <pre className="code mt-8">{`npx dkit add ${id}`}</pre>
      <p className="mt-2 text-sm text-muted">
        Schema-only:{" "}
        <code className="font-mono">npx dkit add {id} --schema-only</code>
        {" · "}
        With seed: <code className="font-mono">npx dkit add {id} --seed</code>
      </p>

      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight">UI preview</h2>
        <p className="text-muted mt-1 text-sm">
          Pick framework + UI kit (saved in localStorage). Blocks run live in
          the browser via Sandpack.
        </p>
        <div className="mt-6">
          <ModuleBlockPreviews moduleId={id} blocks={blocks} />
        </div>
      </section>

      <section className="mt-16">
        <SchemaReference schema={schema} access={access} flows={flows} />
      </section>
    </div>
  );
}
