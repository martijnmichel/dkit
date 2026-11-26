import { createDirectus, readItems, rest } from "@directus/sdk";
import { collections } from "@/lib/dkit/config";

export type SitePage = {
  id: string;
  status: "published" | "draft" | "archived";
  title: string;
  slug: string;
  excerpt?: string | null;
  body?: string | null;
  published_at?: string | null;
};

export async function getPage(slug: string): Promise<SitePage | null> {
  const url = process.env.DIRECTUS_URL;
  if (!url) return null;
  try {
    const client = createDirectus(url).with(rest());
    const rows = (await client.request(
      readItems(collections.pages, {
        filter: {
          _and: [{ status: { _eq: "published" } }, { slug: { _eq: slug } }],
        },
        fields: ["id", "title", "slug", "body", "published_at", "excerpt"],
        limit: 1,
      }),
    )) as SitePage[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}
