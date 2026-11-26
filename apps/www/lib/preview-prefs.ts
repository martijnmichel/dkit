export type PreviewFramework = "next" | "nuxt";
export type PreviewUiKit = "shadcn" | "minimal";
export type PreviewTheme = "dkit" | "neutral" | "zinc" | "stone";

export type PreviewPrefs = {
  framework: PreviewFramework;
  ui: PreviewUiKit;
  theme: PreviewTheme;
};

export const PREVIEW_PREFS_KEY = "dkit.www.preview";

export const DEFAULT_PREVIEW_PREFS: PreviewPrefs = {
  framework: "next",
  ui: "shadcn",
  theme: "dkit",
};

const THEMES: PreviewTheme[] = ["dkit", "neutral", "zinc", "stone"];

export function parsePreviewPrefs(raw: unknown): PreviewPrefs {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_PREVIEW_PREFS };
  const o = raw as Record<string, unknown>;
  const theme =
    typeof o.theme === "string" && THEMES.includes(o.theme as PreviewTheme)
      ? (o.theme as PreviewTheme)
      : DEFAULT_PREVIEW_PREFS.theme;
  return {
    framework: o.framework === "nuxt" ? "nuxt" : "next",
    ui: o.ui === "minimal" ? "minimal" : "shadcn",
    theme,
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
