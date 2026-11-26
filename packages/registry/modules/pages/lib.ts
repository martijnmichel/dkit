import { getDirectus, readItem, readItems } from "@/lib/dkit/client";
import { collections } from "@/lib/dkit/config";
import type { SitePage } from "./types";

export type { SitePage } from "./types";

const PAGE_LIST_FIELDS = [
  "id",
  "title",
  "slug",
  "excerpt",
  "published_at",
] as const;

const PAGE_DETAIL_FIELDS = [
  "id",
  "title",
  "slug",
  "body",
  "published_at",
  "excerpt",
] as const;

/** Published pages, newest first. */
export async function getPages(): Promise<SitePage[]> {
  const client = getDirectus();
  if (!client) return [];
  try {
    return await client.request(
      readItems(collections.pages, {
        filter: { status: { _eq: "published" } },
        fields: [...PAGE_LIST_FIELDS],
        sort: ["-published_at"],
      }),
    );
  } catch {
    return [];
  }
}

export async function getPageBySlug(slug: string): Promise<SitePage | null> {
  const client = getDirectus();
  if (!client) return null;
  try {
    const rows = await client.request(
      readItems(collections.pages, {
        filter: {
          _and: [{ status: { _eq: "published" } }, { slug: { _eq: slug } }],
        },
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
