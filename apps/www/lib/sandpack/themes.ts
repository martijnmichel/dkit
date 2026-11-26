import type { PreviewTheme } from "@/lib/preview-prefs";

export type ThemeTokens = Record<string, string>;

/** Official-ish shadcn base presets + dkit mint. Values are light-mode `:root` tokens. */
export const THEME_PRESETS: Record<
  PreviewTheme,
  { label: string; tokens: ThemeTokens }
> = {
  dkit: {
    label: "dkit",
    tokens: {
      "--radius": "0.5rem",
      "--background": "#ffffff",
      "--foreground": "#0a0a0a",
      "--card": "#ffffff",
      "--card-foreground": "#0a0a0a",
      "--popover": "#ffffff",
      "--popover-foreground": "#0a0a0a",
      "--primary": "oklch(0.72 0.2 155)",
      "--primary-foreground": "oklch(0.18 0.04 155)",
      "--secondary": "#f4f4f5",
      "--secondary-foreground": "#18181b",
      "--muted": "#f4f4f5",
      "--muted-foreground": "#52525b",
      "--accent": "oklch(0.95 0.04 155)",
      "--accent-foreground": "oklch(0.28 0.08 155)",
      "--destructive": "oklch(0.55 0.2 25)",
      "--border": "#e4e4e7",
      "--input": "#e4e4e7",
      "--ring": "oklch(0.72 0.2 155)",
    },
  },
  neutral: {
    label: "Neutral",
    tokens: {
      "--radius": "0.625rem",
      "--background": "oklch(1 0 0)",
      "--foreground": "oklch(0.145 0 0)",
      "--card": "oklch(1 0 0)",
      "--card-foreground": "oklch(0.145 0 0)",
      "--popover": "oklch(1 0 0)",
      "--popover-foreground": "oklch(0.145 0 0)",
      "--primary": "oklch(0.205 0 0)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--secondary": "oklch(0.97 0 0)",
      "--secondary-foreground": "oklch(0.205 0 0)",
      "--muted": "oklch(0.97 0 0)",
      "--muted-foreground": "oklch(0.556 0 0)",
      "--accent": "oklch(0.97 0 0)",
      "--accent-foreground": "oklch(0.205 0 0)",
      "--destructive": "oklch(0.577 0.245 27.325)",
      "--border": "oklch(0.922 0 0)",
      "--input": "oklch(0.922 0 0)",
      "--ring": "oklch(0.708 0 0)",
    },
  },
  zinc: {
    label: "Zinc",
    tokens: {
      "--radius": "0.625rem",
      "--background": "oklch(1 0 0)",
      "--foreground": "oklch(0.141 0.005 285.823)",
      "--card": "oklch(1 0 0)",
      "--card-foreground": "oklch(0.141 0.005 285.823)",
      "--popover": "oklch(1 0 0)",
      "--popover-foreground": "oklch(0.141 0.005 285.823)",
      "--primary": "oklch(0.21 0.006 285.885)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--secondary": "oklch(0.967 0.001 286.375)",
      "--secondary-foreground": "oklch(0.21 0.006 285.885)",
      "--muted": "oklch(0.967 0.001 286.375)",
      "--muted-foreground": "oklch(0.552 0.016 285.938)",
      "--accent": "oklch(0.967 0.001 286.375)",
      "--accent-foreground": "oklch(0.21 0.006 285.885)",
      "--destructive": "oklch(0.577 0.245 27.325)",
      "--border": "oklch(0.92 0.004 286.32)",
      "--input": "oklch(0.92 0.004 286.32)",
      "--ring": "oklch(0.705 0.015 286.067)",
    },
  },
  stone: {
    label: "Stone",
    tokens: {
      "--radius": "0.625rem",
      "--background": "oklch(1 0 0)",
      "--foreground": "oklch(0.147 0.004 49.25)",
      "--card": "oklch(1 0 0)",
      "--card-foreground": "oklch(0.147 0.004 49.25)",
      "--popover": "oklch(1 0 0)",
      "--popover-foreground": "oklch(0.147 0.004 49.25)",
      "--primary": "oklch(0.216 0.006 56.043)",
      "--primary-foreground": "oklch(0.985 0.001 106.423)",
      "--secondary": "oklch(0.97 0.001 106.424)",
      "--secondary-foreground": "oklch(0.216 0.006 56.043)",
      "--muted": "oklch(0.97 0.001 106.424)",
      "--muted-foreground": "oklch(0.553 0.013 58.071)",
      "--accent": "oklch(0.97 0.001 106.424)",
      "--accent-foreground": "oklch(0.216 0.006 56.043)",
      "--destructive": "oklch(0.577 0.245 27.325)",
      "--border": "oklch(0.923 0.003 48.717)",
      "--input": "oklch(0.923 0.003 48.717)",
      "--ring": "oklch(0.709 0.01 56.259)",
    },
  },
};

export const THEME_OPTIONS = (
  Object.keys(THEME_PRESETS) as PreviewTheme[]
).map((id) => ({
  value: id,
  label: THEME_PRESETS[id].label,
}));

const THEME_INLINE = `
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);
}
`.trim();

const CHROME_CSS = `
html, body, #root, #app {
  margin: 0;
  min-height: 100%;
  background: var(--background);
  color: var(--foreground);
  font-family: ui-sans-serif, system-ui, sans-serif;
}
a { color: inherit; }
.dkit-prose {
  --dkit-prose-body: var(--foreground);
  --dkit-prose-heading: var(--foreground);
  --dkit-prose-muted: var(--muted-foreground);
  --dkit-prose-link: var(--primary);
  --dkit-prose-quote-border: color-mix(in oklab, var(--primary) 40%, transparent);
  color: var(--dkit-prose-body);
  font-size: 1.05rem;
  line-height: 1.75;
}
.dkit-prose--compact { font-size: 1rem; line-height: 1.7; }
.dkit-prose :where(p) { margin-bottom: 1rem; }
.dkit-prose :where(a) { color: var(--dkit-prose-link); text-decoration: underline; text-underline-offset: 2px; }
.dkit-prose :where(h2) { margin-top: 2.5rem; font-size: 1.5rem; font-weight: 600; color: var(--dkit-prose-heading); }
.dkit-prose :where(h3) { margin-top: 2rem; font-size: 1.25rem; font-weight: 600; color: var(--dkit-prose-heading); }
.dkit-prose :where(blockquote) { border-left: 2px solid var(--dkit-prose-quote-border); padding-left: 1rem; color: var(--dkit-prose-muted); }
.dkit-prose :where(ul) { margin-bottom: 1rem; padding-left: 1.25rem; list-style: disc; }
.dkit-prose :where(ol) { margin-bottom: 1rem; padding-left: 1.25rem; list-style: decimal; }
.dkit-prose :where(img) { max-width: 100%; height: auto; border-radius: 0.75rem; }
`.trim();

function tokensToCss(tokens: ThemeTokens): string {
  return Object.entries(tokens)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");
}

/** Full Sandpack styles.css for a shadcn theme preset. */
export function buildSandpackThemeCss(theme: PreviewTheme): string {
  const preset = THEME_PRESETS[theme] ?? THEME_PRESETS.dkit;
  return [
    `:root {\n${tokensToCss(preset.tokens)}\n}`,
    THEME_INLINE,
    CHROME_CSS,
  ].join("\n");
}

/** Minimal kit: no brand tokens beyond readable prose. */
export function buildSandpackMinimalCss(): string {
  return [
    `:root {
  --radius: 0.5rem;
  --background: #ffffff;
  --foreground: #18181b;
  --card: #ffffff;
  --card-foreground: #18181b;
  --popover: #ffffff;
  --popover-foreground: #18181b;
  --primary: #18181b;
  --primary-foreground: #fafafa;
  --secondary: #f4f4f5;
  --secondary-foreground: #18181b;
  --muted: #f4f4f5;
  --muted-foreground: #71717a;
  --accent: #f4f4f5;
  --accent-foreground: #18181b;
  --destructive: #dc2626;
  --border: #e4e4e7;
  --input: #e4e4e7;
  --ring: #a1a1aa;
}`,
    THEME_INLINE,
    CHROME_CSS,
  ].join("\n");
}

export function withSandpackThemeCss(
  files: Record<string, string>,
  css: string,
): Record<string, string> {
  const next = { ...files };
  if ("/styles.css" in next) next["/styles.css"] = css;
  if ("/src/styles.css" in next) next["/src/styles.css"] = css;
  return next;
}
