import { ModuleDetailPreview } from "@/components/previews/module-previews";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPages } from "@/lib/dkit/pages";
import { getBlogPosts } from "@/lib/dkit/blog";
import { getModuleMeta, getRegistry } from "@/lib/registry";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const modules = getRegistry().items.filter((i) => i.type === "dkit:module");
  const params: Array<{ id: string; slug: string }> = [];

  for (const mod of modules) {
    if (mod.id === "blog") {
      for (const post of await getBlogPosts()) {
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
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Button asChild variant="link" className="h-auto px-0">
          <a href={`/docs/modules/${id}/`}>← {meta.item.title}</a>
        </Button>
        <span>·</span>
        <span>Sample detail route (seed data)</span>
      </div>
      <Card className="gap-0 overflow-hidden py-0">
        <CardContent className="p-0">
          <ModuleDetailPreview moduleId={id} slug={slug} />
        </CardContent>
      </Card>
    </div>
  );
}
