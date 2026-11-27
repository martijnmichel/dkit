import {
  ModuleSandpackPreviews,
  PreviewPrefsProvider,
} from "@/components/previews/preview-prefs";
import { getBlogPostBySlug } from "@/lib/dkit/blog";
import { getPageBySlug } from "@/lib/dkit/pages";
import type { RegistryItem } from "@/lib/registry";
import { buildModuleSandpackProjects } from "@/lib/sandpack/build-project";
import { BlogDetail } from "../../../../packages/registry/blocks/blog-detail/ui/shadcn/next/blog-detail";
import { PageDetail } from "../../../../packages/registry/blocks/page-detail/ui/shadcn/next/page-detail";

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
        This module has no UI blocks yet. You can still install schema and
        access with <code className="font-mono">dkit add {moduleId} --schema-only</code>.
      </p>
    );
  }

  const seedHint =
    moduleId === "blog" || moduleId === "pages" || moduleId === "settings"
      ? "Preview data comes from the module seed — the same JSON as dkit add --seed."
      : moduleId === "page-builder"
        ? "Preview uses a small sample page so you can inspect the M2A renderer."
        : moduleId === "contact-form"
          ? "Submit in the sandbox is local — nothing is sent to Directus."
          : moduleId === "navigation"
            ? "Preview uses the navigation seed menus (primary / footer)."
            : null;

  const projects = buildModuleSandpackProjects(blocks);

  if (!projects.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Live preview is not available for these blocks yet. Install them with{" "}
        <code className="font-mono">dkit add</code> to try them in your app.
      </p>
    );
  }

  return (
    <PreviewPrefsProvider>
      <ModuleSandpackPreviews seedHint={seedHint} projects={projects} />
    </PreviewPrefsProvider>
  );
}

/** Seeded demo routes under /docs/modules/[id]/demo/[slug]. */
export async function ModuleDetailPreview({
  moduleId,
  slug,
}: {
  moduleId: string;
  slug: string;
}) {
  if (moduleId === "blog") {
    const post = await getBlogPostBySlug(slug);
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
    <p className="p-8 text-muted-foreground">
      No detail demo for this module.
    </p>
  );
}
