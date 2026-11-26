export type SitePage = {
  id: string;
  status: "published" | "draft" | "archived";
  title: string;
  slug: string;
  excerpt?: string | null;
  body?: string | null;
  published_at?: string | null;
};

/** Shared list/query options for pages fetches. */
export type GetPagesOptions = {
  /** Directus status filter. Default `"published"`. Pass `null` to skip. */
  status?: string | null;
  limit?: number;
  sort?: string[];
};

export type GetPageBySlugOptions = {
  status?: string | null;
};
