import { createDirectus, readItems, rest } from "@directus/sdk";
import { collections } from "@/lib/dkit/config";

export type DirectusFileRef = {
  id: string;
};

export type BlogAuthor = {
  id: string;
  status: "published" | "draft";
  name: string;
  slug: string;
  avatar?: string | DirectusFileRef | null;
  bio?: string | null;
};

export type BlogCategory = {
  id: string;
  title: string;
  slug: string;
};

export type BlogPost = {
  id: string;
  status: "published" | "draft" | "archived";
  title: string;
  slug: string;
  excerpt?: string | null;
  body?: string | null;
  published_at?: string | null;
  featured_image?: string | DirectusFileRef | null;
  author?: string | BlogAuthor | null;
  categories?: Array<string | BlogCategory> | null;
};

export function directusFileId(
  value: string | DirectusFileRef | null | undefined,
): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.id ?? null;
}

export function directusAssetUrl(
  fileId: string,
  baseUrl = process.env.DIRECTUS_URL,
): string | null {
  const base = baseUrl?.replace(/\/$/, "");
  if (!base || !fileId) return null;
  return `${base}/assets/${fileId}`;
}

export function authorName(post: BlogPost): string | null {
  return typeof post.author === "object" && post.author?.name
    ? post.author.name
    : null;
}

export function authorAvatarUrl(post: BlogPost): string | null {
  if (typeof post.author !== "object" || !post.author) return null;
  const id = directusFileId(post.author.avatar);
  return id ? directusAssetUrl(id) : null;
}

export function featuredImageUrl(post: BlogPost): string | null {
  const id = directusFileId(post.featured_image);
  return id ? directusAssetUrl(id) : null;
}

type JunctionCategory = {
  id?: number | string;
  categories_id?: BlogCategory | string | null;
};

export function normalizeCategories(
  raw: BlogPost["categories"] | JunctionCategory[] | null | undefined,
): BlogCategory[] {
  if (!Array.isArray(raw)) return [];
  const out: BlogCategory[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    if ("title" in item && "id" in item) {
      out.push(item as BlogCategory);
      continue;
    }
    const related = (item as JunctionCategory).categories_id;
    if (related && typeof related === "object" && "id" in related) {
      out.push(related);
    }
  }
  return out;
}

export async function getPosts(): Promise<BlogPost[]> {
  const url = process.env.DIRECTUS_URL;
  if (!url) return [];
  try {
    const client = createDirectus(url).with(rest());
    return (await client.request(
      readItems(collections.posts, {
        filter: { status: { _eq: "published" } },
        fields: [
          "id",
          "title",
          "slug",
          "excerpt",
          "published_at",
          "featured_image",
          { author: ["id", "name", "slug", "avatar"] },
        ],
        sort: ["-published_at"],
      }),
    )) as BlogPost[];
  } catch {
    return [];
  }
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  const url = process.env.DIRECTUS_URL;
  if (!url) return null;
  try {
    const client = createDirectus(url).with(rest());
    const rows = (await client.request(
      readItems(collections.posts, {
        filter: {
          _and: [{ status: { _eq: "published" } }, { slug: { _eq: slug } }],
        },
        fields: [
          "id",
          "title",
          "slug",
          "body",
          "published_at",
          "featured_image",
          { author: ["id", "name", "slug", "avatar"] },
          { categories: ["id", { categories_id: ["id", "title", "slug"] }] },
        ],
        limit: 1,
      }),
    )) as BlogPost[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}
