import { createDirectus, readItems, rest } from "@directus/sdk";
import { collections } from "@/lib/dkit/config";

export type BlockHero = {
  id: string;
  heading: string;
  subheading?: string | null;
};

export type BlockRichtext = {
  id: string;
  title?: string | null;
  content?: string | null;
};

export type BlockCta = {
  id: string;
  label: string;
  href: string;
};

export type PageBlock =
  | { collection: string; item: BlockHero }
  | { collection: string; item: BlockRichtext }
  | { collection: string; item: BlockCta };

export type BuilderPage = {
  id: string;
  status: "published" | "draft";
  title: string;
  slug: string;
  blocks?: PageBlock[] | null;
};

/** @deprecated use BuilderPage */
export type Page = BuilderPage;

export async function getBuilderPage(slug: string): Promise<BuilderPage | null> {
  const url = process.env.DIRECTUS_URL;
  if (!url) return null;
  try {
    const client = createDirectus(url).with(rest());
    const rows = (await client.request(
      readItems(collections.builder_pages, {
        filter: {
          _and: [{ status: { _eq: "published" } }, { slug: { _eq: slug } }],
        },
        fields: [
          "id",
          "title",
          "slug",
          {
            blocks: ["id", "collection", "item.*"],
          },
        ],
        limit: 1,
      }),
    )) as BuilderPage[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}
