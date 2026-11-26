import { codeToHtml } from "shiki";

const cache = new Map<string, string>();

/** Server-side TypeScript highlight with light/dark dual themes. */
export async function highlightTs(code: string): Promise<string> {
  const key = code;
  const hit = cache.get(key);
  if (hit) return hit;

  const html = await codeToHtml(code, {
    lang: "typescript",
    themes: {
      light: "github-light",
      dark: "github-dark",
    },
    defaultColor: false,
  });

  cache.set(key, html);
  return html;
}
