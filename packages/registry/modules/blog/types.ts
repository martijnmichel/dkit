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

export type PostsCategoriesRow = {
  id: number;
  posts_id: string | BlogPost;
  categories_id: string | BlogCategory;
};

/** Shared list/query options for blog fetches. */
export type GetBlogPostsOptions = {
  /** Directus status filter. Default `"published"`. Pass `null` to skip. */
  status?: string | null;
  limit?: number;
  /** Filter by category slug. */
  category?: string;
  sort?: string[];
};

export type GetBlogAuthorsOptions = {
  status?: string | null;
  limit?: number;
  sort?: string[];
};

export type GetBlogCategoriesOptions = {
  limit?: number;
  sort?: string[];
};

export type GetBlogBySlugOptions = {
  status?: string | null;
};
