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
