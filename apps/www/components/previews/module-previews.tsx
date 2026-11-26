import { BlockFrame } from "@/components/previews/block-frame";
import { getPostBySlug, getPosts } from "@/lib/dkit/blog";
import { getPageBySlug, getPages } from "@/lib/dkit/pages";
import { getBuilderPageBySlug } from "@/lib/dkit/page-builder";
import type { RegistryItem } from "@/lib/registry";
import { BlogDetail } from "../../../../packages/registry/blocks/blog-detail/ui/next/blog-detail";
import { BlogDetailMinimal } from "../../../../packages/registry/blocks/blog-detail-minimal/ui/next/blog-detail-minimal";
import { BlogList } from "../../../../packages/registry/blocks/blog-list/ui/next/blog-list";
import { BlogListCards } from "../../../../packages/registry/blocks/blog-list-cards/ui/next/blog-list-cards";
import { ContactForm } from "../../../../packages/registry/blocks/contact-form-ui/ui/next/contact-form";
import { PageDetail } from "../../../../packages/registry/blocks/page-detail/ui/next/page-detail";
import { PageDetailMinimal } from "../../../../packages/registry/blocks/page-detail-minimal/ui/next/page-detail-minimal";
import { PageRenderer } from "../../../../packages/registry/blocks/page-renderer/ui/next/page-renderer";

async function firstBlogSlug(): Promise<string> {
  const posts = await getPosts();
  return posts[0]?.slug ?? "sample-getting-started";
}

async function firstPageSlug(): Promise<string> {
  const pages = await getPages();
  return pages[0]?.slug ?? "about";
}

export async function renderBlockPreview(blockId: string) {
  switch (blockId) {
    case "blog-list":
      return <BlogList />;
    case "blog-list-cards":
      return <BlogListCards />;
    case "blog-detail":
      return <BlogDetail slug={await firstBlogSlug()} />;
    case "blog-detail-minimal":
      return <BlogDetailMinimal slug={await firstBlogSlug()} />;
    case "page-detail":
      return <PageDetail slug={await firstPageSlug()} />;
    case "page-detail-minimal":
      return <PageDetailMinimal slug={await firstPageSlug()} />;
    case "contact-form-ui":
      return (
        <div className="px-6 py-12">
          <ContactForm />
          <p className="mx-auto mt-4 max-w-md text-center text-xs text-stone-400">
            Preview only — submissions are not sent to Directus.
          </p>
        </div>
      );
    case "page-renderer": {
      const page = await getBuilderPageBySlug("sample");
      return page ? (
        <PageRenderer slug="sample" />
      ) : (
        <p className="p-8 text-sm text-stone-500">No fixture page.</p>
      );
    }
    default:
      return (
        <p className="p-8 text-sm text-stone-500">
          No live preview wired for <code className="font-mono">{blockId}</code>{" "}
          yet.
        </p>
      );
  }
}

export async function ModuleBlockPreviews({
  moduleId,
  blocks,
}: {
  moduleId: string;
  blocks: RegistryItem[];
}) {
  if (!blocks.length) {
    return (
      <p className="text-sm text-stone-500">
        This module has no UI blocks in the registry.
      </p>
    );
  }

  const seedHint =
    moduleId === "blog" || moduleId === "pages"
      ? "Rendered from module seed data (same JSON as dkit add --seed)."
      : moduleId === "page-builder"
        ? "Rendered from a small directory fixture (no seed.json yet)."
        : moduleId === "contact-form"
          ? "Interactive UI preview — submit is mocked."
          : null;

  const frames = await Promise.all(
    blocks.map(async (block) => ({
      block,
      node: await renderBlockPreview(block.id),
    })),
  );

  return (
    <div className="space-y-8">
      {seedHint ? (
        <p className="text-sm text-stone-500">{seedHint}</p>
      ) : null}
      {frames.map(({ block, node }) => (
        <BlockFrame
          key={block.id}
          title={block.id}
          description={block.description}
        >
          {node}
        </BlockFrame>
      ))}
    </div>
  );
}

/** Used by demo slug routes so list → detail links work. */
export async function ModuleDetailPreview({
  moduleId,
  slug,
}: {
  moduleId: string;
  slug: string;
}) {
  if (moduleId === "blog") {
    const post = await getPostBySlug(slug);
    if (!post) return <p className="p-8 text-stone-500">Post not found.</p>;
    return <BlogDetail slug={slug} />;
  }
  if (moduleId === "pages") {
    const page = await getPageBySlug(slug);
    if (!page) return <p className="p-8 text-stone-500">Page not found.</p>;
    return <PageDetail slug={slug} />;
  }
  return (
    <p className="p-8 text-stone-500">No detail preview for this module.</p>
  );
}
