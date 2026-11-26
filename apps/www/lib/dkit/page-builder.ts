import { collections } from "@/lib/dkit/config";
import type {
  BuilderPage,
  PageBlock,
} from "../../../../packages/registry/modules/page-builder/types";

export type {
  BlockCta,
  BlockHero,
  BlockRichtext,
  BuilderPage,
  BuilderPagesBlocksRow,
  Page,
  PageBlock,
} from "../../../../packages/registry/modules/page-builder/types";

/** Sample page for directory previews until the module ships seed.json. */
const FIXTURE: BuilderPage = {
  id: "preview-builder",
  status: "published",
  title: "Sample composed page",
  slug: "sample",
  blocks: [
    {
      collection: collections.block_hero,
      item: {
        id: "1",
        heading: "Composable blocks",
        subheading: "M2A sections from the page-builder module",
      },
    },
    {
      collection: collections.block_richtext,
      item: {
        id: "2",
        title: "What you get",
        content:
          "<p>Install this module to create pages from hero, rich text, and CTA blocks in Directus. Use the renderer UI in your Next.js app to output the composed page.</p><p>Confirm block order, publishing, and public read access after <code>dkit add page-builder</code>.</p>",
      },
    },
    {
      collection: collections.block_cta,
      item: { id: "3", label: "Browse modules", href: "/modules/" },
    },
  ] as PageBlock[],
};

export async function getBuilderPages(): Promise<BuilderPage[]> {
  return [FIXTURE];
}

export async function getBuilderPageBySlug(
  slug: string,
): Promise<BuilderPage | null> {
  return slug === FIXTURE.slug ? FIXTURE : null;
}

export async function getBuilderPageById(
  id: string,
): Promise<BuilderPage | null> {
  return id === FIXTURE.id ? FIXTURE : null;
}

export const getBuilderPage = getBuilderPageBySlug;
