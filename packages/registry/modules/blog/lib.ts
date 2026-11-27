import {
  directusAssetUrl,
  directusFileId,
  dkitQueryFailed,
  getDirectus,
  readItem,
  readItems,
} from "@/lib/dkit/client";
import { collections } from "@/lib/dkit/config";
import type {
  BlogAuthor,
  BlogCategory,
  BlogPost,
  GetBlogAuthorsOptions,
  GetBlogBySlugOptions,
  GetBlogCategoriesOptions,
  GetBlogPostsOptions,
} from "./types";

export type {
  BlogAuthor,
  BlogCategory,
  BlogPost,
  DirectusFileRef,
  GetBlogAuthorsOptions,
  GetBlogBySlugOptions,
  GetBlogCategoriesOptions,
  GetBlogPostsOptions,
  PostsCategoriesRow,
} from "./types";

const POST_LIST_FIELDS = [
  "id",
  "status",
  "title",
  "slug",
  "excerpt",
  "published_at",
  "featured_image",
  { author: ["id", "name", "slug", "avatar"] },
] as const;

const POST_DETAIL_FIELDS = [
  "id",
  "status",
  "title",
  "slug",
  "body",
  "excerpt",
  "published_at",
  "featured_image",
  { author: ["id", "name", "slug", "avatar", "bio"] },
  { categories: ["id", { categories_id: ["id", "title", "slug"] }] },
] as const;

const AUTHOR_FIELDS = ["id", "status", "name", "slug", "avatar", "bio"] as const;
const CATEGORY_FIELDS = ["id", "title", "slug"] as const;

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

function statusFilter(status: string | null | undefined) {
  if (status === null) return undefined;
  return { status: { _eq: status ?? "published" } };
}

/** Directus rejects `limit=undefined` — only send a finite number. */
function queryLimit(limit: number | undefined): number | undefined {
  return typeof limit === "number" && Number.isFinite(limit) ? limit : undefined;
}

/** Posts, newest first. Defaults to status=published (pass status: null to skip). */
export async function getBlogPosts(
  options: GetBlogPostsOptions = {},
): Promise<BlogPost[]> {
  const client = getDirectus();
  if (!client) return [];
  if (!collections.posts) {
    dkitQueryFailed(
      'collections.posts missing from lib/dkit/config — re-run `dkit add blog` (check collection prefix matches Directus, e.g. "dkit_posts")',
    );
    return [];
  }
  const status = statusFilter(options.status);
  const and: Record<string, unknown>[] = [];
  if (status) and.push(status);
  if (options.category) {
    and.push({
      categories: {
        categories_id: { slug: { _eq: options.category } },
      },
    });
  }
  const limit = queryLimit(options.limit);
  try {
    return await client.request(
      readItems(collections.posts, {
        filter: and.length ? { _and: and } : undefined,
        fields: [...POST_LIST_FIELDS],
        sort: options.sort ?? ["-published_at"],
        ...(limit !== undefined ? { limit } : {}),
      }),
    );
  } catch (err) {
    dkitQueryFailed(
      `getBlogPosts failed (collection=${collections.posts})`,
      err,
    );
    return [];
  }
}

export async function getBlogPostBySlug(
  slug: string,
  options: GetBlogBySlugOptions = {},
): Promise<BlogPost | null> {
  const client = getDirectus();
  if (!client) return null;
  if (!collections.posts) {
    dkitQueryFailed("collections.posts missing from lib/dkit/config");
    return null;
  }
  const status = statusFilter(options.status);
  const and: Record<string, unknown>[] = [{ slug: { _eq: slug } }];
  if (status) and.unshift(status);
  try {
    const rows = await client.request(
      readItems(collections.posts, {
        filter: { _and: and },
        fields: [...POST_DETAIL_FIELDS],
        limit: 1,
      }),
    );
    return rows[0] ?? null;
  } catch (err) {
    dkitQueryFailed(
      `getBlogPostBySlug(${slug}) failed (collection=${collections.posts})`,
      err,
    );
    return null;
  }
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const client = getDirectus();
  if (!client) return null;
  if (!collections.posts) return null;
  try {
    return await client.request(
      readItem(collections.posts, id, {
        fields: [...POST_DETAIL_FIELDS],
      }),
    );
  } catch (err) {
    dkitQueryFailed(`getBlogPostById(${id}) failed`, err);
    return null;
  }
}

/** Authors, by name. */
export async function getBlogAuthors(
  options: GetBlogAuthorsOptions = {},
): Promise<BlogAuthor[]> {
  const client = getDirectus();
  if (!client) return [];
  if (!collections.authors) return [];
  const status = statusFilter(options.status);
  const limit = queryLimit(options.limit);
  try {
    return await client.request(
      readItems(collections.authors, {
        filter: status,
        fields: [...AUTHOR_FIELDS],
        sort: options.sort ?? ["name"],
        ...(limit !== undefined ? { limit } : {}),
      }),
    );
  } catch (err) {
    dkitQueryFailed(
      `getBlogAuthors failed (collection=${collections.authors})`,
      err,
    );
    return [];
  }
}

export async function getBlogAuthorBySlug(
  slug: string,
  options: GetBlogBySlugOptions = {},
): Promise<BlogAuthor | null> {
  const client = getDirectus();
  if (!client) return null;
  if (!collections.authors) return null;
  const status = statusFilter(options.status);
  const and: Record<string, unknown>[] = [{ slug: { _eq: slug } }];
  if (status) and.unshift(status);
  try {
    const rows = await client.request(
      readItems(collections.authors, {
        filter: { _and: and },
        fields: [...AUTHOR_FIELDS],
        limit: 1,
      }),
    );
    return rows[0] ?? null;
  } catch (err) {
    dkitQueryFailed(`getBlogAuthorBySlug(${slug}) failed`, err);
    return null;
  }
}

export async function getBlogAuthorById(id: string): Promise<BlogAuthor | null> {
  const client = getDirectus();
  if (!client) return null;
  if (!collections.authors) return null;
  try {
    return await client.request(
      readItem(collections.authors, id, {
        fields: [...AUTHOR_FIELDS],
      }),
    );
  } catch (err) {
    dkitQueryFailed(`getBlogAuthorById(${id}) failed`, err);
    return null;
  }
}

/** Categories, by title. */
export async function getBlogCategories(
  options: GetBlogCategoriesOptions = {},
): Promise<BlogCategory[]> {
  const client = getDirectus();
  if (!client) return [];
  if (!collections.categories) return [];
  const limit = queryLimit(options.limit);
  try {
    return await client.request(
      readItems(collections.categories, {
        fields: [...CATEGORY_FIELDS],
        sort: options.sort ?? ["title"],
        ...(limit !== undefined ? { limit } : {}),
      }),
    );
  } catch (err) {
    dkitQueryFailed(
      `getBlogCategories failed (collection=${collections.categories})`,
      err,
    );
    return [];
  }
}

export async function getBlogCategoryBySlug(
  slug: string,
): Promise<BlogCategory | null> {
  const client = getDirectus();
  if (!client) return null;
  if (!collections.categories) return null;
  try {
    const rows = await client.request(
      readItems(collections.categories, {
        filter: { slug: { _eq: slug } },
        fields: [...CATEGORY_FIELDS],
        limit: 1,
      }),
    );
    return rows[0] ?? null;
  } catch (err) {
    dkitQueryFailed(`getBlogCategoryBySlug(${slug}) failed`, err);
    return null;
  }
}

export async function getBlogCategoryById(
  id: string,
): Promise<BlogCategory | null> {
  const client = getDirectus();
  if (!client) return null;
  if (!collections.categories) return null;
  try {
    return await client.request(
      readItem(collections.categories, id, {
        fields: [...CATEGORY_FIELDS],
      }),
    );
  } catch (err) {
    dkitQueryFailed(`getBlogCategoryById(${id}) failed`, err);
    return null;
  }
}

/** @deprecated prefer getBlogPosts({ category }) */
export async function getBlogPostsByCategorySlug(
  categorySlug: string,
  options: Omit<GetBlogPostsOptions, "category"> = {},
): Promise<BlogPost[]> {
  return getBlogPosts({ ...options, category: categorySlug });
}

/** @deprecated prefer getBlogPostBySlug */
export const getBlogPost = getBlogPostBySlug;
/** @deprecated prefer getBlogPosts */
export const getPosts = getBlogPosts;
/** @deprecated prefer getBlogPostBySlug */
export const getPostBySlug = getBlogPostBySlug;
/** @deprecated prefer getBlogPostById */
export const getPostById = getBlogPostById;
/** @deprecated prefer getBlogPostBySlug */
export const getPost = getBlogPostBySlug;
/** @deprecated prefer getBlogCategories */
export const getCategories = getBlogCategories;
/** @deprecated prefer getBlogAuthors */
export const getAuthors = getBlogAuthors;
/** @deprecated prefer getBlogAuthorBySlug */
export const getAuthorBySlug = getBlogAuthorBySlug;
/** @deprecated prefer getBlogAuthorById */
export const getAuthorById = getBlogAuthorById;
