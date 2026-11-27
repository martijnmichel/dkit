import { StaticRedirect } from "@/components/static-redirect";
import { getPages } from "@/lib/dkit/pages";
import { getBlogPosts } from "@/lib/dkit/blog";
import { getRegistry } from "@/lib/registry";
import { redirectMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}): Promise<Metadata> {
  const { id, slug } = await params;
  return redirectMetadata(`/docs/modules/${id}/demo/${slug}/`);
}

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

export default async function ModuleDemoRedirectPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = await params;
  return <StaticRedirect href={`/docs/modules/${id}/demo/${slug}/`} />;
}
