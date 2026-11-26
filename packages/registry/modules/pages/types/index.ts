export type SitePage = {
  id: string;
  status: "published" | "draft" | "archived";
  title: string;
  slug: string;
  excerpt?: string | null;
  body?: string | null;
  published_at?: string | null;
};
