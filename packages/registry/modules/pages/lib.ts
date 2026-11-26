import { getDirectus, readItem, readItems } from "@/lib/dkit/client";
import { collections } from "@/lib/dkit/config";
import type {
  GetPageBySlugOptions,
  GetPagesOptions,
  SitePage,
} from "./types";

export type {
  GetPageBySlugOptions,
  GetPagesOptions,
  SitePage,
} from "./types";

const PAGE_LIST_FIELDS = [
  "id",
  "status",
  "title",
  "slug",
  "excerpt",
  "published_at",
] as const;

const PAGE_DETAIL_FIELDS = [
  "id",
  "status",
  "title",
  "slug",
  "body",
  "published_at",
  "excerpt",
] as const;

function statusFilter(status: string | null | undefined) {
  if (status === null) return undefined;
  return { status: { _eq: status ?? "published" } };
}

/**
 * Pages module list helper.
 * Module id is `pages`, so the name is `getPages` (not `getPagesPages`).
 */
export async function getPages(
  options: GetPagesOptions = {},
): Promise<SitePage[]> {
  const client = getDirectus();
  if (!client) return [];
  try {
    return await client.request(
      readItems(collections.pages, {
        filter: statusFilter(options.status),
        fields: [...PAGE_LIST_FIELDS],
        sort: options.sort ?? ["-published_at"],
        limit: options.limit,
      }),
    );
  } catch {
    return [];
  }
}

export async function getPageBySlug(
  slug: string,
  options: GetPageBySlugOptions = {},
): Promise<SitePage | null> {
  const client = getDirectus();
  if (!client) return null;
  const status = statusFilter(options.status);
  const and: Record<string, unknown>[] = [{ slug: { _eq: slug } }];
  if (status) and.unshift(status);
  try {
    const rows = await client.request(
      readItems(collections.pages, {
        filter: { _and: and },
        fields: [...PAGE_DETAIL_FIELDS],
        limit: 1,
      }),
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function getPageById(id: string): Promise<SitePage | null> {
  const client = getDirectus();
  if (!client) return null;
  try {
    return await client.request(
      readItem(collections.pages, id, {
        fields: [...PAGE_DETAIL_FIELDS],
      }),
    );
  } catch {
    return null;
  }
}

/** @deprecated prefer getPageBySlug */
export const getPage = getPageBySlug;
