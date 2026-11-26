import { highlightTs } from "@/lib/highlight-ts";
import type { LibExportDoc } from "@/lib/module-lib-docs";

export async function ServiceExportsList({
  exports: items,
}: {
  exports: LibExportDoc[];
}) {
  const highlighted = await Promise.all(
    items.map(async (fn) => ({
      ...fn,
      html: await highlightTs(fn.signature),
    })),
  );

  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {highlighted.map((fn) => (
        <li key={fn.name} className="px-4 py-3.5">
          {fn.description ? (
            <p className="mb-2 text-sm text-muted-foreground">{fn.description}</p>
          ) : null}
          <div
            className="ts-sig"
            dangerouslySetInnerHTML={{ __html: fn.html }}
          />
        </li>
      ))}
    </ul>
  );
}
