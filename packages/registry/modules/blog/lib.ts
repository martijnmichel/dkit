import { getDirectus, readItem, readItems } from "@/lib/dkit/client";
import { collections } from "@/lib/dkit/config";
import type {
  BlogAuthor,
  BlogCategory,
  BlogPost,
  DirectusFileRef,
} from "./types";

export type {
  BlogAuthor,
  BlogCategory,
  BlogPost,
  DirectusFileRef,
  PostsCategoriesRow,
} from "./types";

const POST_LIST_FIELDS = [
  "id",
  "title",
  "slug",
  "excerpt",
  "published_at",
  "featured_image",
  { author: ["id", "name", "slug", "avatar"] },
] as const;

const POST_DETAIL_FIELDS = [
  "id",
  "title",
  "slug",
  "body",
  "excerpt",
  "published_at",
  "featured_image",
  { author: ["id", "name", "slug", "avatar", "bio"] },
  { categories: ["id", { categories_id: ["id", "title", "slug"] }] },
] as const;

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

/** Published posts, newest first. */
export async function getPosts(): Promise<BlogPost[]> {
  const client = getDirectus();
  if (!client) return [];
  try {
    return await client.request(
      readItems(collections.posts, {
        filter: { status: { _eq: "published" } },
        fields: [...POST_LIST_FIELDS],
        sort: ["-published_at"],
      }),
    );
  } catch {
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const client = getDirectus();
  if (!client) return null;
  try {
    const rows = await client.request(
      readItems(collections.posts, {
        filter: {
          _and: [{ status: { _eq: "published" } }, { slug: { _eq: slug } }],
        },
        fields: [...POST_DETAIL_FIELDS],
        limit: 1,
      }),
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  const client = getDirectus();
  if (!client) return null;
  try {
    return await client.request(
      readItem(collections.posts, id, {
        fields: [...POST_DETAIL_FIELDS],
      }),
    );
  } catch {
    return null;
  }
}

/** @deprecated prefer getPostBySlug */
export const getPost = getPostBySlug;

export async function getAuthors(): Promise<BlogAuthor[]> {
  const client = getDirectus();
  if (!client) return [];
  try {
    return await client.request(
      readItems(collections.authors, {
        filter: { status: { _eq: "published" } },
        fields: ["id", "status", "name", "slug", "avatar", "bio"],
        sort: ["name"],
      }),
    );
  } catch {
    return [];
  }
}

export async function getAuthorBySlug(slug: string): Promise<BlogAuthor | null> {
  const client = getDirectus();
  if (!client) return null;
  try {
    const rows = await client.request(
      readItems(collections.authors, {
        filter: {
          _and: [{ status: { _eq: "published" } }, { slug: { _eq: slug } }],
        },
        fields: ["id", "status", "name", "slug", "avatar", "bio"],
        limit: 1,
      }),
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function getAuthorById(id: string): Promise<BlogAuthor | null> {
  const client = getDirectus();
  if (!client) return null;
  try {
    return await client.request(
      readItem(collections.authors, id, {
        fields: ["id", "status", "name", "slug", "avatar", "bio"],
      }),
    );
  } catch {
    return null;
  }
}

export async function getCategories(): Promise<BlogCategory[]> {
  const client = getDirectus();
  if (!client) return [];
  try {
    return await client.request(
      readItems(collections.categories, {
        fields: ["id", "title", "slug"],
        sort: ["title"],
      }),
    );
  } catch {
    return [];
  }
}

export async function getCategoryBySlug(
  slug: string,
): Promise<BlogCategory | null> {
  const client = getDirectus();
  if (!client) return null;
  try {
    const rows = await client.request(
      readItems(collections.categories, {
        filter: { slug: { _eq: slug } },
        fields: ["id", "title", "slug"],
        limit: 1,
      }),
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function getCategoryById(id: string): Promise<BlogCategory | null> {
  const client = getDirectus();
  if (!client) return null;
  try {
    return await client.request(
      readItem(collections.categories, id, {
        fields: ["id", "title", "slug"],
      }),
    );
  } catch {
    return null;
  }
}

/** Published posts in a category (by category slug). */
export async function getPostsByCategorySlug(
  categorySlug: string,
): Promise<BlogPost[]> {
  const client = getDirectus();
  if (!client) return [];
  try {
    return await client.request(
      readItems(collections.posts, {
        filter: {
          _and: [
            { status: { _eq: "published" } },
            {
              categories: {
                categories_id: { slug: { _eq: categorySlug } },
              },
            },
          ],
        },
        fields: [...POST_LIST_FIELDS],
        sort: ["-published_at"],
      }),
    );
  } catch {
    return [];
  }
}
