import type { PreviewFramework, PreviewUiKit } from "@/lib/preview-prefs";

export type SandpackFiles = Record<string, string>;

export type KitVariantFiles = {
  next: SandpackFiles | null;
  nuxt: SandpackFiles | null;
};

export type BlockSandpackProject = {
  blockId: string;
  title: string;
  description?: string;
  frameworks: PreviewFramework[];
  uiKits: PreviewUiKit[];
  variants: Partial<Record<PreviewUiKit, KitVariantFiles>>;
};

/** Pick preferred kit if the block ships it; otherwise first available. */
export function resolveProjectUiKit(
  project: BlockSandpackProject,
  preferred: PreviewUiKit,
): PreviewUiKit {
  if (project.uiKits.includes(preferred)) return preferred;
  return project.uiKits[0] ?? "shadcn";
}
