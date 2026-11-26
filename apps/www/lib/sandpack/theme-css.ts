/** Shared theme + prose CSS injected into every Sandpack preview. */
export const SANDPACK_THEME_CSS = `
:root {
  --radius: 0.5rem;
  --background: oklch(0.985 0.002 90);
  --foreground: oklch(0.2 0.01 60);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.2 0.01 60);
  --primary: oklch(0.45 0.1 175);
  --primary-foreground: oklch(0.98 0.01 175);
  --secondary: oklch(0.96 0.005 90);
  --secondary-foreground: oklch(0.25 0.01 60);
  --muted: oklch(0.95 0.005 90);
  --muted-foreground: oklch(0.5 0.015 60);
  --accent: oklch(0.95 0.01 175);
  --accent-foreground: oklch(0.3 0.05 175);
  --destructive: oklch(0.55 0.2 25);
  --border: oklch(0.9 0.005 90);
  --input: oklch(0.9 0.005 90);
  --ring: oklch(0.45 0.1 175);
}
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
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
