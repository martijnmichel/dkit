import { getDirectus, readItem, readItems } from "@/lib/dkit/client";
import { collections } from "@/lib/dkit/config";
import type { BuilderPage } from "./types";

export type {
  BlockCta,
  BlockHero,
  BlockRichtext,
  BuilderPage,
  BuilderPagesBlocksRow,
  Page,
  PageBlock,
} from "./types";

const BUILDER_LIST_FIELDS = ["id", "status", "title", "slug"] as const;

const BUILDER_DETAIL_FIELDS = [
  "id",
  "status",
  "title",
  "slug",
  {
    blocks: ["id", "collection", "item.*"],
  },
] as const;

/** Published builder pages. */
export async function getBuilderPages(): Promise<BuilderPage[]> {
  const client = getDirectus();
  if (!client) return [];
  try {
    return await client.request(
      readItems(collections.builder_pages, {
        filter: { status: { _eq: "published" } },
        fields: [...BUILDER_LIST_FIELDS],
        sort: ["title"],
      }),
    );
  } catch {
    return [];
  }
}

export async function getBuilderPageBySlug(
  slug: string,
): Promise<BuilderPage | null> {
  const client = getDirectus();
  if (!client) return null;
  try {
    const rows = await client.request(
      readItems(collections.builder_pages, {
        filter: {
          _and: [{ status: { _eq: "published" } }, { slug: { _eq: slug } }],
        },
        fields: [...BUILDER_DETAIL_FIELDS],
        limit: 1,
      }),
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function getBuilderPageById(
  id: string,
): Promise<BuilderPage | null> {
  const client = getDirectus();
  if (!client) return null;
  try {
    return await client.request(
      readItem(collections.builder_pages, id, {
        fields: [...BUILDER_DETAIL_FIELDS],
      }),
    );
  } catch {
    return null;
  }
}

/** @deprecated prefer getBuilderPageBySlug */
export const getBuilderPage = getBuilderPageBySlug;
