export type BlockHero = {
  id: string;
  heading: string;
  subheading?: string | null;
};

export type BlockRichtext = {
  id: string;
  title?: string | null;
  content?: string | null;
};

export type BlockCta = {
  id: string;
  label: string;
  href: string;
};

export type PageBlock =
  | { collection: string; item: BlockHero }
  | { collection: string; item: BlockRichtext }
  | { collection: string; item: BlockCta };

export type BuilderPage = {
  id: string;
  status: "published" | "draft";
  title: string;
  slug: string;
  blocks?: PageBlock[] | null;
};

export type BuilderPagesBlocksRow = {
  id: number;
  builder_pages_id: string | BuilderPage;
  collection: string;
  item: string;
};

/** @deprecated use BuilderPage */
export type Page = BuilderPage;
