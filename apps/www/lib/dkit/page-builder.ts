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

/** Inline fixture — page-builder has no seed.json yet. */
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
        subheading: "Preview fixture for the page-builder module",
      },
    },
    {
      collection: collections.block_richtext,
      item: {
        id: "2",
        title: "About this preview",
        content:
          "<p>This module has no seed file yet. The directory shows a small fixture so the renderer is visible.</p>",
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
