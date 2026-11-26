import {
  OnThisPageMobile,
  OnThisPageRail,
  type TocItem,
} from "@/components/on-this-page";
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
  const hasFlows = (flows?.flows?.length ?? 0) > 0;

  const toc: TocItem[] = [
    { id: "install", label: "Install" },
    { id: "preview", label: "UI preview" },
    { id: "schema", label: "Schema" },
    { id: "access", label: "Access" },
  ];
  if (hasFlows) toc.push({ id: "flows", label: "Flows" });

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_11rem] xl:gap-10">
        <div className="min-w-0">
          <OnThisPageMobile items={toc} />

          <p className="badge">dkit:module</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
            {meta.item.title}
          </h1>
          <p className="mt-2 text-muted-foreground">{meta.item.description}</p>

          <section id="install" className="scroll-mt-24">
            <pre className="code mt-8">{`npx dkit add ${id}`}</pre>
            <p className="mt-2 text-sm text-muted-foreground">
              Schema only:{" "}
              <code className="font-mono">
                npx dkit add {id} --schema-only
              </code>
              {" · "}
              With sample data:{" "}
              <code className="font-mono">npx dkit add {id} --seed</code>
            </p>
          </section>

          <section id="preview" className="mt-14 scroll-mt-24">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              UI preview
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Switch framework and UI kit to match your stack. The live sandbox
              runs the same block sources you get from{" "}
              <code className="font-mono">dkit add</code>.
            </p>
            <div className="mt-6">
              <ModuleBlockPreviews moduleId={id} blocks={blocks} />
            </div>
          </section>

          <div className="mt-16">
            <SchemaReference schema={schema} access={access} flows={flows} />
          </div>
        </div>

        <aside className="hidden xl:block">
          <OnThisPageRail items={toc} />
        </aside>
      </div>
    </div>
  );
}
