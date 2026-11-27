import {
  dkitQueryFailed,
  getDirectus,
  readItem,
  readItems,
} from "@/lib/dkit/client";
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

/** Directus rejects `limit=undefined` — only send a finite number. */
function queryLimit(limit: number | undefined): number | undefined {
  return typeof limit === "number" && Number.isFinite(limit) ? limit : undefined;
}

/** Builder pages for the page-builder module. Defaults to status=published. */
export async function getPageBuilderPages(
  options: GetPageBuilderPagesOptions = {},
): Promise<BuilderPage[]> {
  const client = getDirectus();
  if (!client) return [];
  if (!collections.builder_pages) {
    dkitQueryFailed(
      "collections.builder_pages missing from lib/dkit/config — re-run `dkit add page-builder`",
    );
    return [];
  }
  const limit = queryLimit(options.limit);
  try {
    return await client.request(
      readItems(collections.builder_pages, {
        filter: statusFilter(options.status),
        fields: [...BUILDER_LIST_FIELDS],
        sort: options.sort ?? ["title"],
        ...(limit !== undefined ? { limit } : {}),
      }),
    );
  } catch (err) {
    dkitQueryFailed(
      `getPageBuilderPages failed (collection=${collections.builder_pages})`,
      err,
    );
    return [];
  }
}

export async function getPageBuilderPageBySlug(
  slug: string,
  options: GetPageBuilderPageBySlugOptions = {},
): Promise<BuilderPage | null> {
  const client = getDirectus();
  if (!client) return null;
  if (!collections.builder_pages) {
    dkitQueryFailed("collections.builder_pages missing from lib/dkit/config");
    return null;
  }
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
  } catch (err) {
    dkitQueryFailed(
      `getPageBuilderPageBySlug(${slug}) failed (collection=${collections.builder_pages})`,
      err,
    );
    return null;
  }
}

export async function getPageBuilderPageById(
  id: string,
): Promise<BuilderPage | null> {
  const client = getDirectus();
  if (!client) return null;
  if (!collections.builder_pages) return null;
  try {
    return await client.request(
      readItem(collections.builder_pages, id, {
        fields: [...BUILDER_DETAIL_FIELDS],
      }),
    );
  } catch (err) {
    dkitQueryFailed(`getPageBuilderPageById(${id}) failed`, err);
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
