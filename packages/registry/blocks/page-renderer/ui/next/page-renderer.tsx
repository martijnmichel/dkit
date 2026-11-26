import type { PageBlock } from "@/lib/dkit/page-builder";
import { getBuilderPage } from "@/lib/dkit/page-builder";
import { collections } from "@/lib/dkit/config";

function BlockView({ block }: { block: PageBlock }) {
  switch (block.collection) {
    case collections.block_hero:
      return (
        <section className="space-y-3 py-12 text-center">
          <h1 className="text-4xl font-semibold tracking-tight">
            {(block.item as { heading?: string }).heading}
          </h1>
          {(block.item as { subheading?: string }).subheading ? (
            <p className="text-lg text-neutral-500">
              {(block.item as { subheading?: string }).subheading}
            </p>
          ) : null}
        </section>
      );
    case collections.block_richtext:
      return (
        <section className="mx-auto max-w-2xl py-8">
          {(block.item as { title?: string }).title ? (
            <h2 className="mb-4 text-2xl font-medium">
              {(block.item as { title?: string }).title}
            </h2>
          ) : null}
          {(block.item as { content?: string }).content ? (
            <div
              className="prose prose-neutral dark:prose-invert"
              dangerouslySetInnerHTML={{
                __html: (block.item as { content?: string }).content ?? "",
              }}
            />
          ) : null}
        </section>
      );
    case collections.block_cta:
      return (
        <section className="flex justify-center py-8">
          <a
            href={(block.item as { href?: string }).href}
            className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
          >
            {(block.item as { label?: string }).label}
          </a>
        </section>
      );
    default:
      return null;
  }
}

export async function PageRenderer({ slug }: { slug: string }) {
  const page = await getBuilderPage(slug);
  if (!page) {
    return (
      <div className="py-10 text-center text-neutral-500">Page not found.</div>
    );
  }

  const blocks = (page.blocks ?? []) as PageBlock[];

  return (
    <div>
      {blocks.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
    </div>
  );
}
