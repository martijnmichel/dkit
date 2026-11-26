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

/** Resolve a file id from a Directus file field (uuid or expanded object). */
export function directusFileId(
  value: string | DirectusFileRef | null | undefined,
): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.id ?? null;
}

/** Public asset URL for a Directus file id. */
export function directusAssetUrl(
  fileId: string,
  baseUrl = process.env.DIRECTUS_URL,
): string | null {
  const base = baseUrl?.replace(/\/$/, "");
  if (!base || !fileId) return null;
  return `${base}/assets/${fileId}`;
}
