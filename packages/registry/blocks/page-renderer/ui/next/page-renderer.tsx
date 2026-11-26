import { createDirectus, readItems, rest } from "@directus/sdk";
import type { Page, PageBlock } from "@/lib/dkit/page-builder";

async function getPage(slug: string): Promise<Page | null> {
  const url = process.env.DIRECTUS_URL;
  if (!url) return null;
  const client = createDirectus(url).with(rest());
  const rows = (await client.request(
    readItems("pages", {
      filter: {
        _and: [{ status: { _eq: "published" } }, { slug: { _eq: slug } }],
      },
      fields: [
        "id",
        "title",
        "slug",
        {
          blocks: [
            "id",
            "collection",
            "item.*",
          ],
        },
      ],
      limit: 1,
    }),
  )) as Page[];
  return rows[0] ?? null;
}

function BlockView({ block }: { block: PageBlock }) {
  switch (block.collection) {
    case "block_hero":
      return (
        <section className="space-y-3 py-12 text-center">
          <h1 className="text-4xl font-semibold tracking-tight">{block.item.heading}</h1>
          {block.item.subheading ? (
            <p className="text-lg text-neutral-500">{block.item.subheading}</p>
          ) : null}
        </section>
      );
    case "block_richtext":
      return (
        <section className="mx-auto max-w-2xl py-8">
          {block.item.title ? (
            <h2 className="mb-4 text-2xl font-medium">{block.item.title}</h2>
          ) : null}
          {block.item.content ? (
            <div
              className="prose prose-neutral dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: block.item.content }}
            />
          ) : null}
        </section>
      );
    case "block_cta":
      return (
        <section className="flex justify-center py-8">
          <a
            href={block.item.href}
            className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
          >
            {block.item.label}
          </a>
        </section>
      );
    default:
      return null;
  }
}

export async function PageRenderer({ slug }: { slug: string }) {
  const page = await getPage(slug);
  if (!page) {
    return <div className="py-10 text-center text-neutral-500">Page not found.</div>;
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
