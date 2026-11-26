import { loadModuleSeed, previewAssetUrl } from "@/lib/preview/seeds";
import type {
  BlogAuthor,
  BlogCategory,
  BlogPost,
  DirectusFileRef,
} from "../../../../packages/registry/modules/blog/types";

export type {
  BlogAuthor,
  BlogCategory,
  BlogPost,
  DirectusFileRef,
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
    typeof row.author === "string" ? row.author : (row.author as { id?: string })?.id;
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

export function directusFileId(
  value: string | DirectusFileRef | null | undefined,
): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.id ?? null;
}

export function directusAssetUrl(fileId: string): string | null {
  return previewAssetUrl("blog", fileId);
}

export function authorName(post: BlogPost): string | null {
  return typeof post.author === "object" && post.author?.name
    ? post.author.name
    : null;
}

export function authorAvatarUrl(post: BlogPost): string | null {
  if (typeof post.author !== "object" || !post.author) return null;
  return previewAssetUrl("blog", post.author.avatar);
}

export function featuredImageUrl(post: BlogPost): string | null {
  return previewAssetUrl("blog", post.featured_image);
}

export function normalizeCategories(
  raw: BlogPost["categories"] | null | undefined,
): BlogCategory[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (c): c is BlogCategory => typeof c === "object" && c !== null && "id" in c,
  );
}

export async function getPosts(): Promise<BlogPost[]> {
  const rows = seed()?.items?.posts ?? [];
  return rows
    .filter((r) => r.status === "published")
    .map((r) => hydratePost(r))
    .sort((a, b) =>
      String(b.published_at ?? "").localeCompare(String(a.published_at ?? "")),
    );
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const row = (seed()?.items?.posts ?? []).find(
    (r) => r.status === "published" && r.slug === slug,
  );
  return row ? hydratePost(row) : null;
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  const row = (seed()?.items?.posts ?? []).find((r) => String(r.id) === id);
  return row ? hydratePost(row) : null;
}

export const getPost = getPostBySlug;

export async function getAuthors(): Promise<BlogAuthor[]> {
  return (seed()?.items?.authors ?? []).map((r) => r as unknown as BlogAuthor);
}

export async function getAuthorBySlug(slug: string): Promise<BlogAuthor | null> {
  const row = (seed()?.items?.authors ?? []).find((r) => r.slug === slug);
  return row ? (row as unknown as BlogAuthor) : null;
}

export async function getAuthorById(id: string): Promise<BlogAuthor | null> {
  return authorsById().get(id) ?? null;
}

export async function getCategories(): Promise<BlogCategory[]> {
  return (seed()?.items?.categories ?? []).map(
    (r) => r as unknown as BlogCategory,
  );
}

export async function getCategoryBySlug(
  slug: string,
): Promise<BlogCategory | null> {
  const row = (seed()?.items?.categories ?? []).find((r) => r.slug === slug);
  return row ? (row as unknown as BlogCategory) : null;
}

export async function getCategoryById(id: string): Promise<BlogCategory | null> {
  return categoriesById().get(id) ?? null;
}

export async function getPostsByCategorySlug(
  categorySlug: string,
): Promise<BlogPost[]> {
  const cat = await getCategoryBySlug(categorySlug);
  if (!cat) return [];
  const posts = await getPosts();
  return posts.filter((p) =>
    normalizeCategories(p.categories).some((c) => c.id === cat.id),
  );
}
