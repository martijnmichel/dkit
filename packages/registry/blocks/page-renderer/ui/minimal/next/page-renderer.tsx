import type { PageBlock } from "@/lib/dkit/page-builder";
import { getBuilderPage } from "@/lib/dkit/page-builder";
import { collections } from "@/lib/dkit/config";

/** Minimal kit — semantic HTML + dkit-prose only. */
function BlockView({ block }: { block: PageBlock }) {
  switch (block.collection) {
    case collections.block_hero:
      return (
        <section>
          <h1>{(block.item as { heading?: string }).heading}</h1>
          {(block.item as { subheading?: string }).subheading ? (
            <p>{(block.item as { subheading?: string }).subheading}</p>
          ) : null}
        </section>
      );
    case collections.block_richtext:
      return (
        <section>
          {(block.item as { title?: string }).title ? (
            <h2>{(block.item as { title?: string }).title}</h2>
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
    case collections.block_cta:
      return (
        <section>
          <p>
            <a href={(block.item as { href?: string }).href}>
              {(block.item as { label?: string }).label}
            </a>
          </p>
        </section>
      );
    default:
      return null;
  }
}

export async function PageRenderer({ slug }: { slug: string }) {
  const page = await getBuilderPage(slug);
  if (!page) {
    return <p>Page not found.</p>;
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
