import {
  ModuleSandpackPreviews,
  PreviewPrefsProvider,
} from "@/components/previews/preview-prefs";
import { getPostBySlug } from "@/lib/dkit/blog";
import { getPageBySlug } from "@/lib/dkit/pages";
import type { RegistryItem } from "@/lib/registry";
import { buildModuleSandpackProjects } from "@/lib/sandpack/build-project";
import { BlogDetail } from "../../../../packages/registry/blocks/blog-detail/ui/next/blog-detail";
import { PageDetail } from "../../../../packages/registry/blocks/page-detail/ui/next/page-detail";

export async function ModuleBlockPreviews({
  moduleId,
  blocks,
}: {
  moduleId: string;
  blocks: RegistryItem[];
}) {
  if (!blocks.length) {
    return (
      <p className="text-sm text-muted-foreground">
        This module has no UI blocks in the registry.
      </p>
    );
  }

  const seedHint =
    moduleId === "blog" || moduleId === "pages"
      ? "Fed by module seed data (same JSON as dkit add --seed)."
      : moduleId === "page-builder"
        ? "Fed by a small directory fixture."
        : moduleId === "contact-form"
          ? "Submit is mocked inside the sandbox."
          : null;

  const projects = buildModuleSandpackProjects(blocks);

  if (!projects.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Sandpack projects are not wired for these blocks yet.
      </p>
    );
  }

  return (
    <PreviewPrefsProvider>
      <ModuleSandpackPreviews seedHint={seedHint} projects={projects} />
    </PreviewPrefsProvider>
  );
}

/** Used by demo slug routes so list → detail links work outside Sandpack. */
export async function ModuleDetailPreview({
  moduleId,
  slug,
}: {
  moduleId: string;
  slug: string;
}) {
  if (moduleId === "blog") {
    const post = await getPostBySlug(slug);
    if (!post) {
      return <p className="p-8 text-muted-foreground">Post not found.</p>;
    }
    return <BlogDetail slug={slug} />;
  }
  if (moduleId === "pages") {
    const page = await getPageBySlug(slug);
    if (!page) {
      return <p className="p-8 text-muted-foreground">Page not found.</p>;
    }
    return <PageDetail slug={slug} />;
  }
  return (
    <p className="p-8 text-muted-foreground">No detail preview for this module.</p>
  );
}
