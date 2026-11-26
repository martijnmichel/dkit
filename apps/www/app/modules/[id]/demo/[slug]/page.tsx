import { ModuleDetailPreview } from "@/components/previews/module-previews";
import { getPages } from "@/lib/dkit/pages";
import { getPosts } from "@/lib/dkit/blog";
import { getModuleMeta, getRegistry } from "@/lib/registry";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const modules = getRegistry().items.filter((i) => i.type === "dkit:module");
  const params: Array<{ id: string; slug: string }> = [];

  for (const mod of modules) {
    if (mod.id === "blog") {
      for (const post of await getPosts()) {
        params.push({ id: "blog", slug: post.slug });
      }
    }
    if (mod.id === "pages") {
      for (const page of await getPages()) {
        params.push({ id: "pages", slug: page.slug });
      }
    }
  }
  return params;
}

export default async function ModuleDemoSlugPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = await params;
  const meta = getModuleMeta(id);
  if (!meta || meta.item.type !== "dkit:module") notFound();
  if (id !== "blog" && id !== "pages") notFound();

  return (
    <div className="px-6 py-8 lg:px-10">
      <p className="mb-4 text-sm text-muted-foreground">
        <a
          href={`/modules/${id}/`}
          className="underline-offset-2 hover:underline"
        >
          ← {meta.item.title}
        </a>
        <span className="mx-2">·</span>
        Sample detail route (seed data)
      </p>
      <div className="overflow-hidden rounded-xl border border-border bg-background">
        <ModuleDetailPreview moduleId={id} slug={slug} />
      </div>
    </div>
  );
}
