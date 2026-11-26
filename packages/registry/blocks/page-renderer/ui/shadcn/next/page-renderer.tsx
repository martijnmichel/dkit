import type { PageBlock } from "@/lib/dkit/page-builder";
import { getPageBuilderPageBySlug } from "@/lib/dkit/page-builder";
import { collections } from "@/lib/dkit/config";
import { Button } from "@/components/ui/button";

/** Uses your project's shadcn/ui components. */
function BlockView({ block }: { block: PageBlock }) {
  switch (block.collection) {
    case collections.block_hero:
      return (
        <section className="space-y-3 py-12 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            {(block.item as { heading?: string }).heading}
          </h1>
          {(block.item as { subheading?: string }).subheading ? (
            <p className="text-lg text-muted-foreground">
              {(block.item as { subheading?: string }).subheading}
            </p>
          ) : null}
        </section>
      );
    case collections.block_richtext:
      return (
        <section className="mx-auto max-w-2xl py-8">
          {(block.item as { title?: string }).title ? (
            <h2 className="mb-4 text-2xl font-medium text-foreground">
              {(block.item as { title?: string }).title}
            </h2>
          ) : null}
          {(block.item as { content?: string }).content ? (
            <div
              className="dkit-prose"
              dangerouslySetInnerHTML={{
                __html: (block.item as { content?: string }).content ?? "",
              }}
            />
          ) : null}
        </section>
      );
    case collections.block_cta: {
      const href = (block.item as { href?: string }).href;
      const label = (block.item as { label?: string }).label;
      return (
        <section className="flex justify-center py-8">
          <Button asChild>
            <a href={href}>{label}</a>
          </Button>
        </section>
      );
    }
    default:
      return null;
  }
}

export async function PageRenderer({ slug }: { slug: string }) {
  const page = await getPageBuilderPageBySlug(slug);
  if (!page) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        Page not found.
      </div>
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
