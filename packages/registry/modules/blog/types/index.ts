export type BlogAuthor = {
  id: string;
  status: "published" | "draft";
  name: string;
  slug: string;
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
  author?: string | BlogAuthor | null;
  categories?: Array<string | BlogCategory> | null;
};
