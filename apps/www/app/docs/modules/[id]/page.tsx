import {
  OnThisPageMobile,
  OnThisPageRail,
  type TocItem,
} from "@/components/on-this-page";
import { DirectusIcon } from "@/components/directus-icon";
import { FlowsSeedReference } from "@/components/flows-seed-reference";
import { JsonLd } from "@/components/json-ld";
import { ModuleServicesReference } from "@/components/module-services-reference";
import { ModuleBlockPreviews } from "@/components/previews/module-previews";
import { SchemaReference } from "@/components/schema-reference";
import { Badge } from "@/components/ui/badge";
import { getModuleLibDoc } from "@/lib/module-lib-docs";
import {
  getBlocksForModule,
  getModuleIcon,
  getModuleMeta,
  getRegistry,
} from "@/lib/registry";
import type { RestSchemaDoc } from "@/lib/schema-docs";
import {
  breadcrumbJsonLd,
  moduleJsonLd,
  pageMetadata,
} from "@/lib/seo";
import { parseFlowsBundle, parseSeedBundle } from "@/lib/services-docs";
import { LayoutTemplate } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return getRegistry()
    .items.filter((i) => i.type === "dkit:module")
    .map((i) => ({ id: i.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const meta = getModuleMeta(id);
  if (!meta || meta.item.type !== "dkit:module") {
    return { title: "Module not found" };
  }
  return pageMetadata({
    title: meta.item.title,
    description: meta.item.description,
    path: `/docs/modules/${id}/`,
  });
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

  const { flows } = parseFlowsBundle(meta.flows);
  const { files, collections } = parseSeedBundle(meta.seed);
  const hasFlowsSeed =
    flows.length > 0 ||
    files.length > 0 ||
    collections.some((c) => c.count > 0);
  const hasLib = Boolean(getModuleLibDoc(id)?.exports.length);

  const blocks = getBlocksForModule(id);
  const moduleIcon = getModuleIcon(id);

  const toc: TocItem[] = [
    { id: "install", label: "Install" },
    { id: "schema", label: "Schema" },
    { id: "access", label: "Access" },
  ];
  if (hasLib) toc.push({ id: "services", label: "Services" });
  if (hasFlowsSeed) toc.push({ id: "flows-seed", label: "Flows & seed" });
  toc.push({ id: "preview", label: "UI preview" });

  return (
    <div className="bg-background px-6 py-10 lg:px-10">
      <JsonLd
        data={[
          moduleJsonLd({
            id,
            title: meta.item.title,
            description: meta.item.description,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Docs", path: "/docs/" },
            { name: "Modules", path: "/docs/modules/" },
            { name: meta.item.title, path: `/docs/modules/${id}/` },
          ]),
        ]}
      />
      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_11rem] xl:gap-12">
        <article className="module-prose min-w-0">
          <OnThisPageMobile items={toc} />

          <Badge variant="outline">dkit:module</Badge>
          <h1 className="mt-4 flex items-center gap-3 text-foreground">
            <DirectusIcon name={moduleIcon} size="xl" className="text-primary" />
            {meta.item.title}
          </h1>
          <p className="lede mt-3 max-w-2xl">{meta.item.description}</p>

          <section id="install" className="scroll-mt-24">
            <pre className="code mt-8">{`npx @kurbo/dkit add ${id}`}</pre>
            <p className="mt-3 text-[0.9375rem] text-muted-foreground">
              Interactive install multi-selects UI components (defaults
              pre-selected). Schema only:{" "}
              <code>npx @kurbo/dkit add {id} --schema-only</code>
              {" · "}
              With sample data:{" "}
              <code>npx @kurbo/dkit add {id} --seed</code>
            </p>
          </section>

          <div className="mt-16">
            <SchemaReference schema={schema} access={access} />
          </div>

          {hasLib ? (
            <div className="mt-16">
              <ModuleServicesReference moduleId={id} />
            </div>
          ) : null}

          {hasFlowsSeed ? (
            <div className="mt-16">
              <FlowsSeedReference
                moduleId={id}
                flows={meta.flows}
                seed={meta.seed}
              />
            </div>
          ) : null}

          <section id="preview" className="mt-16 scroll-mt-24">
            <h2 className="flex items-center gap-2 text-foreground">
              <LayoutTemplate className="size-5 text-primary" aria-hidden />
              UI preview
            </h2>
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
