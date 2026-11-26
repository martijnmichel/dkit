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
  | { collection: "block_hero"; item: BlockHero }
  | { collection: "block_richtext"; item: BlockRichtext }
  | { collection: "block_cta"; item: BlockCta };

export type Page = {
  id: string;
  status: "published" | "draft";
  title: string;
  slug: string;
  blocks?: PageBlock[] | null;
};
