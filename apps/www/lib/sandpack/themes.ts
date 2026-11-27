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
      "--primary": "#00c769",
      "--primary-foreground": "#042a16",
      "--secondary": "#f4f4f5",
      "--secondary-foreground": "#18181b",
      "--muted": "#f4f4f5",
      "--muted-foreground": "#52525b",
      "--accent": "#e6faf0",
      "--accent-foreground": "#0a5c35",
      "--destructive": "oklch(0.55 0.2 25)",
      "--border": "#e4e4e7",
      "--input": "#e4e4e7",
      "--ring": "#00c769",
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

/**
 * Maps semantic tokens → Tailwind v4 `--color-*` theme keys.
 * Must live in `<style type="text/tailwindcss">` for @tailwindcss/browser.
 */
/** `@theme inline` keeps utilities as `var(--primary)` so theme switches update fills. */
const TAILWIND_THEME_MAP = `
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
*, *::before, *::after {
  border-color: var(--border);
}
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
.dkit-prose :where(pre) {
  overflow-x: auto;
  border-radius: 0.5rem;
  background: var(--muted, #f4f4f5);
  padding: 1rem;
  font-size: 0.875rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  line-height: 1.55;
}
.dkit-prose :where(:not(pre) > code) {
  border-radius: 0.375rem;
  background: var(--muted, #f4f4f5);
  padding: 0.15em 0.4em;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.8125em;
  font-weight: 500;
}
.dkit-prose :where(pre code) { background: transparent; padding: 0; font-size: inherit; font-weight: inherit; }
`.trim();

function tokensToCss(tokens: ThemeTokens): string {
  return Object.entries(tokens)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");
}

function rootBlock(tokens: ThemeTokens): string {
  return `:root {\n${tokensToCss(tokens)}\n}`;
}

/** Vite-imported styles.css — semantic tokens + chrome (not @theme). */
export function buildSandpackThemeCss(theme: PreviewTheme): string {
  const preset = THEME_PRESETS[theme] ?? THEME_PRESETS.dkit;
  return [rootBlock(preset.tokens), CHROME_CSS].join("\n");
}

/**
 * Minimal preview CSS — no Preflight / no form resets.
 * Keep prose helpers + light page chrome; leave inputs/buttons as UA styles.
 */
export function buildSandpackMinimalCss(): string {
  return `
html, body, #root, #app {
  margin: 0;
  min-height: 100%;
  background: #fff;
  color: #000;
}
.dkit-preview-pad {
  padding: 1.5rem 1.25rem;
}
.dkit-prose {
  color: inherit;
  font-size: 1.05rem;
  line-height: 1.75;
}
.dkit-prose--compact { font-size: 1rem; line-height: 1.7; }
.dkit-prose :where(p) { margin-bottom: 1rem; }
.dkit-prose :where(a) { color: #0000ee; }
.dkit-prose :where(h2) { margin-top: 2.5rem; font-size: 1.5rem; font-weight: 600; }
.dkit-prose :where(h3) { margin-top: 2rem; font-size: 1.25rem; font-weight: 600; }
.dkit-prose :where(blockquote) {
  border-left: 2px solid #ccc;
  padding-left: 1rem;
  color: #555;
}
.dkit-prose :where(ul) { margin-bottom: 1rem; padding-left: 1.25rem; list-style: disc; }
.dkit-prose :where(ol) { margin-bottom: 1rem; padding-left: 1.25rem; list-style: decimal; }
.dkit-prose :where(img) { max-width: 100%; height: auto; }
.dkit-prose :where(pre) {
  overflow-x: auto;
  background: #f4f4f5;
  padding: 1rem;
  font-size: 0.875rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  line-height: 1.55;
}
.dkit-prose :where(:not(pre) > code) {
  background: #f4f4f5;
  padding: 0.15em 0.4em;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.8125em;
}
.dkit-prose :where(pre code) { background: transparent; padding: 0; font-size: inherit; }
`.trim();
}

/**
 * Content for `<style type="text/tailwindcss">`.
 * @tailwindcss/browser only processes @theme from this type — regular CSS
 * imports never register bg-primary / text-muted-foreground / etc.
 */
export function buildSandpackTailwindThemeStyle(): string {
  return TAILWIND_THEME_MAP;
}

const THEME_STYLE_START = "<!-- dkit-theme-start -->";
const THEME_STYLE_END = "<!-- dkit-theme-end -->";

/** Inject Play-CDN theme bridge into Sandpack index.html. */
export function withSandpackIndexTheme(html: string): string {
  if (html.includes(THEME_STYLE_START)) return html;
  const block = `${THEME_STYLE_START}
<style type="text/tailwindcss">
${buildSandpackTailwindThemeStyle()}
</style>
${THEME_STYLE_END}`;
  if (html.includes("</head>")) {
    return html.replace("</head>", `  ${block}\n  </head>`);
  }
  return `${block}\n${html}`;
}

/** Remove Tailwind Play CDN + @theme bridge (used for minimal / browser-default kits). */
export function stripSandpackTailwind(html: string): string {
  return html
    .replace(
      /<script[^>]*@tailwindcss\/browser[^>]*><\/script>\s*/gi,
      "",
    )
    .replace(
      new RegExp(
        `${THEME_STYLE_START}[\\s\\S]*?${THEME_STYLE_END}\\s*`,
        "g",
      ),
      "",
    );
}

/** Swap styles.css (+ ensure index.html has the Tailwind @theme bridge). */
export function withSandpackThemeCss(
  files: Record<string, string>,
  css: string,
  opts: { tailwind?: boolean } = {},
): Record<string, string> {
  const useTailwind = opts.tailwind !== false;
  const next = { ...files };
  if ("/styles.css" in next) next["/styles.css"] = css;
  if ("/src/styles.css" in next) next["/src/styles.css"] = css;
  if ("/index.html" in next) {
    next["/index.html"] = useTailwind
      ? withSandpackIndexTheme(next["/index.html"]!)
      : stripSandpackTailwind(next["/index.html"]!);
  }
  return next;
}
