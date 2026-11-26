import {
  directusAssetUrl,
  directusFileId,
} from "@/lib/dkit/client";
import { loadModuleSeed } from "@/lib/preview/seeds";
import type {
  BlogAuthor,
  BlogCategory,
  BlogPost,
  GetBlogAuthorsOptions,
  GetBlogBySlugOptions,
  GetBlogCategoriesOptions,
  GetBlogPostsOptions,
} from "../../../../packages/registry/modules/blog/types";

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
} from "../../../../packages/registry/modules/blog/types";

function seed() {
  return loadModuleSeed("blog");
}

function authorsById(): Map<string, BlogAuthor> {
  const map = new Map<string, BlogAuthor>();
  for (const row of seed()?.items?.authors ?? []) {
    map.set(String(row.id), row as unknown as BlogAuthor);
  }
  return map;
}

function categoriesById(): Map<string, BlogCategory> {
  const map = new Map<string, BlogCategory>();
  for (const row of seed()?.items?.categories ?? []) {
    map.set(String(row.id), row as unknown as BlogCategory);
  }
  return map;
}

function hydratePost(row: Record<string, unknown>): BlogPost {
  const authors = authorsById();
  const categories = categoriesById();
  const junctions = seed()?.items?.posts_categories ?? [];
  const authorId =
    typeof row.author === "string"
      ? row.author
      : (row.author as { id?: string })?.id;
  const catIds = junctions
    .filter((j) => String(j.posts_id) === String(row.id))
    .map((j) => String(j.categories_id));

  return {
    ...(row as unknown as BlogPost),
    author: authorId ? (authors.get(authorId) ?? authorId) : null,
    categories: catIds
      .map((id) => categories.get(id))
      .filter(Boolean) as BlogCategory[],
  };
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

export function normalizeCategories(
  raw: BlogPost["categories"] | null | undefined,
): BlogCategory[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (c): c is BlogCategory => typeof c === "object" && c !== null && "id" in c,
  );
}

export async function getBlogPosts(
  options: GetBlogPostsOptions = {},
): Promise<BlogPost[]> {
  const status = options.status === null ? null : (options.status ?? "published");
  let rows = (seed()?.items?.posts ?? []).map((r) => hydratePost(r));
  if (status !== null) rows = rows.filter((r) => r.status === status);
  if (options.category) {
    rows = rows.filter((p) =>
      normalizeCategories(p.categories).some((c) => c.slug === options.category),
    );
  }
  rows.sort((a, b) =>
    String(b.published_at ?? "").localeCompare(String(a.published_at ?? "")),
  );
  if (options.limit != null) rows = rows.slice(0, options.limit);
  return rows;
}

export async function getBlogPostBySlug(
  slug: string,
  options: GetBlogBySlugOptions = {},
): Promise<BlogPost | null> {
  const status = options.status === null ? null : (options.status ?? "published");
  const row = (seed()?.items?.posts ?? []).find((r) => {
    if (r.slug !== slug) return false;
    if (status === null) return true;
    return r.status === status;
  });
  return row ? hydratePost(row) : null;
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const row = (seed()?.items?.posts ?? []).find((r) => String(r.id) === id);
  return row ? hydratePost(row) : null;
}

export async function getBlogAuthors(
  options: GetBlogAuthorsOptions = {},
): Promise<BlogAuthor[]> {
  const status = options.status === null ? null : (options.status ?? "published");
  let rows = (seed()?.items?.authors ?? []).map(
    (r) => r as unknown as BlogAuthor,
  );
  if (status !== null) rows = rows.filter((r) => r.status === status);
  rows.sort((a, b) => String(a.name).localeCompare(String(b.name)));
  if (options.limit != null) rows = rows.slice(0, options.limit);
  return rows;
}

export async function getBlogAuthorBySlug(
  slug: string,
  options: GetBlogBySlugOptions = {},
): Promise<BlogAuthor | null> {
  const status = options.status === null ? null : (options.status ?? "published");
  const row = (seed()?.items?.authors ?? []).find((r) => {
    if (r.slug !== slug) return false;
    if (status === null) return true;
    return r.status === status;
  });
  return row ? (row as unknown as BlogAuthor) : null;
}

export async function getBlogAuthorById(id: string): Promise<BlogAuthor | null> {
  return authorsById().get(id) ?? null;
}

export async function getBlogCategories(
  options: GetBlogCategoriesOptions = {},
): Promise<BlogCategory[]> {
  let rows = (seed()?.items?.categories ?? []).map(
    (r) => r as unknown as BlogCategory,
  );
  rows.sort((a, b) => String(a.title).localeCompare(String(b.title)));
  if (options.limit != null) rows = rows.slice(0, options.limit);
  return rows;
}

export async function getBlogCategoryBySlug(
  slug: string,
): Promise<BlogCategory | null> {
  const row = (seed()?.items?.categories ?? []).find((r) => r.slug === slug);
  return row ? (row as unknown as BlogCategory) : null;
}

export async function getBlogCategoryById(
  id: string,
): Promise<BlogCategory | null> {
  return categoriesById().get(id) ?? null;
}

/** @deprecated prefer getBlogPosts({ category }) */
export async function getBlogPostsByCategorySlug(
  categorySlug: string,
  options: Omit<GetBlogPostsOptions, "category"> = {},
): Promise<BlogPost[]> {
  return getBlogPosts({ ...options, category: categorySlug });
}
