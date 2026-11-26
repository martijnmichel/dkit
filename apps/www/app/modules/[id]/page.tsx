import {
  OnThisPageMobile,
  OnThisPageRail,
  type TocItem,
} from "@/components/on-this-page";
import { ModuleBlockPreviews } from "@/components/previews/module-previews";
import { SchemaReference } from "@/components/schema-reference";
import { Badge } from "@/components/ui/badge";
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
    { id: "schema", label: "Schema" },
    { id: "access", label: "Access" },
  ];
  if (hasFlows) toc.push({ id: "flows", label: "Flows" });
  toc.push({ id: "preview", label: "UI preview" });

  return (
    <div className="bg-background px-6 py-10 lg:px-10">
      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_11rem] xl:gap-12">
        <article className="module-prose min-w-0">
          <OnThisPageMobile items={toc} />

          <Badge variant="outline">dkit:module</Badge>
          <h1 className="mt-4 text-foreground">{meta.item.title}</h1>
          <p className="lede mt-3 max-w-2xl">{meta.item.description}</p>

          <section id="install" className="scroll-mt-24">
            <pre className="code mt-8">{`npx dkit add ${id}`}</pre>
            <p className="mt-3 text-[0.9375rem] text-muted-foreground">
              Schema only:{" "}
              <code className="font-mono">
                npx dkit add {id} --schema-only
              </code>
              {" · "}
              With sample data:{" "}
              <code className="font-mono">npx dkit add {id} --seed</code>
            </p>
          </section>

          <div className="mt-16">
            <SchemaReference schema={schema} access={access} flows={flows} />
          </div>

          <section id="preview" className="mt-16 scroll-mt-24">
            <h2 className="text-foreground">UI preview</h2>
            <div className="mt-6">
              <ModuleBlockPreviews moduleId={id} blocks={blocks} />
            </div>
          </section>
        </article>

        <aside className="hidden xl:block">
          <OnThisPageRail items={toc} />
        </aside>
      </div>
    </div>
  );
}
