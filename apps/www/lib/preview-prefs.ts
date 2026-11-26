export type PreviewFramework = "next" | "nuxt";
export type PreviewUiKit = "shadcn" | "minimal";

export type PreviewPrefs = {
  framework: PreviewFramework;
  ui: PreviewUiKit;
};

export const PREVIEW_PREFS_KEY = "dkit.www.preview";

export const DEFAULT_PREVIEW_PREFS: PreviewPrefs = {
  framework: "next",
  ui: "shadcn",
};

export function parsePreviewPrefs(raw: unknown): PreviewPrefs {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_PREVIEW_PREFS };
  const o = raw as Record<string, unknown>;
  return {
    framework: o.framework === "nuxt" ? "nuxt" : "next",
    ui: o.ui === "minimal" ? "minimal" : "shadcn",
  };
}

export function readPreviewPrefs(): PreviewPrefs {
  if (typeof window === "undefined") return { ...DEFAULT_PREVIEW_PREFS };
  try {
    const raw = window.localStorage.getItem(PREVIEW_PREFS_KEY);
    if (!raw) return { ...DEFAULT_PREVIEW_PREFS };
    return parsePreviewPrefs(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_PREVIEW_PREFS };
  }
}

export function writePreviewPrefs(prefs: PreviewPrefs): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREVIEW_PREFS_KEY, JSON.stringify(prefs));
}

/**
 * Pick which registry blocks to show for a UI kit.
 * - shadcn: drop `*-minimal` twins
 * - minimal: prefer `*-minimal` when present; keep blocks with no twin
 */
function blockKey(b: { id?: string; blockId?: string }): string {
  return b.blockId ?? b.id ?? "";
}

export function selectBlocksForUiKit<T extends { id?: string; blockId?: string }>(
  blocks: T[],
  ui: PreviewUiKit,
): T[] {
  const byId = new Map(blocks.map((b) => [blockKey(b), b]));

  if (ui === "minimal") {
    const out: T[] = [];
    const covered = new Set<string>();

    for (const b of blocks) {
      const id = blockKey(b);
      if (!id.endsWith("-minimal")) continue;
      out.push(b);
      covered.add(id);
      covered.add(id.replace(/-minimal$/, ""));
    }

    for (const b of blocks) {
      const id = blockKey(b);
      if (covered.has(id)) continue;
      if (byId.has(`${id}-minimal`)) continue;
      out.push(b);
      covered.add(id);
    }

    return out;
  }

  return blocks.filter((b) => !blockKey(b).endsWith("-minimal"));
}
