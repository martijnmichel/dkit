import { getDirectus, readItem, readItems } from "@/lib/dkit/client";
import { collections } from "@/lib/dkit/config";
import type {
  BuilderPage,
  GetPageBuilderPageBySlugOptions,
  GetPageBuilderPagesOptions,
} from "./types";

export type {
  BlockCta,
  BlockHero,
  BlockRichtext,
  BuilderPage,
  BuilderPagesBlocksRow,
  GetPageBuilderPageBySlugOptions,
  GetPageBuilderPagesOptions,
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

function statusFilter(status: string | null | undefined) {
  if (status === null) return undefined;
  return { status: { _eq: status ?? "published" } };
}

/** Builder pages for the page-builder module. */
export async function getPageBuilderPages(
  options: GetPageBuilderPagesOptions = {},
): Promise<BuilderPage[]> {
  const client = getDirectus();
  if (!client) return [];
  try {
    return await client.request(
      readItems(collections.builder_pages, {
        filter: statusFilter(options.status),
        fields: [...BUILDER_LIST_FIELDS],
        sort: options.sort ?? ["title"],
        limit: options.limit,
      }),
    );
  } catch {
    return [];
  }
}

export async function getPageBuilderPageBySlug(
  slug: string,
  options: GetPageBuilderPageBySlugOptions = {},
): Promise<BuilderPage | null> {
  const client = getDirectus();
  if (!client) return null;
  const status = statusFilter(options.status);
  const and: Record<string, unknown>[] = [{ slug: { _eq: slug } }];
  if (status) and.unshift(status);
  try {
    const rows = await client.request(
      readItems(collections.builder_pages, {
        filter: { _and: and },
        fields: [...BUILDER_DETAIL_FIELDS],
        limit: 1,
      }),
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function getPageBuilderPageById(
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

/** @deprecated prefer getPageBuilderPages */
export const getBuilderPages = getPageBuilderPages;
/** @deprecated prefer getPageBuilderPageBySlug */
export const getBuilderPageBySlug = getPageBuilderPageBySlug;
/** @deprecated prefer getPageBuilderPageById */
export const getBuilderPageById = getPageBuilderPageById;
/** @deprecated prefer getPageBuilderPageBySlug */
export const getBuilderPage = getPageBuilderPageBySlug;
