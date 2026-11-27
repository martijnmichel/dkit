import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  parseFlowsBundle,
  parseSeedBundle,
} from "@/lib/services-docs";

/** Directus flows + optional seed under services/ — not the TypeScript fetch API. */
export function FlowsSeedReference({
  flows: flowsRaw,
  seed: seedRaw,
  moduleId,
}: {
  flows?: unknown;
  seed?: unknown;
  moduleId: string;
}) {
  const { flows, operationsCount } = parseFlowsBundle(flowsRaw);
  const { files, collections } = parseSeedBundle(seedRaw);
  const hasFlows = flows.length > 0;
  const hasSeed = files.length > 0 || collections.some((c) => c.count > 0);

  if (!hasFlows && !hasSeed) return null;

  return (
    <section id="flows-seed" className="scroll-mt-24 space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Flows &amp; seed
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Optional Directus extras from <code>services/</code>. Flows apply on{" "}
          <code>dkit add</code>; seed only with <code>--seed</code>.
        </p>
      </div>

      {hasFlows ? (
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base">Flows</CardTitle>
            <CardDescription>
              <code>services/flows.json</code>
              {operationsCount > 0
                ? ` · ${operationsCount} operation(s)`
                : null}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {flows.map((f) => (
              <div key={f.name} className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm text-foreground">{f.name}</strong>
                  {f.status ? (
                    <Badge variant="outline" className="font-mono">
                      {f.status}
                    </Badge>
                  ) : null}
                  {f.trigger ? (
                    <Badge variant="secondary" className="font-mono">
                      {f.trigger}
                    </Badge>
                  ) : null}
                </div>
                {f.description ? (
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                ) : null}
                {f.options?.collections?.length || f.options?.scope?.length ? (
                  <p className="font-mono text-[0.75rem] text-muted-foreground">
                    {[
                      f.options.type,
                      f.options.scope?.join(", "),
                      f.options.collections?.join(", "),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {hasSeed ? (
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base">Seed</CardTitle>
            <CardDescription>
              <code>services/seed.json</code> — import with{" "}
              <code>npx @kurbo/dkit add {moduleId} --seed</code>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {files.length > 0 ? (
              <div>
                <h3 className="text-sm font-medium text-foreground">Files</h3>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {files.map((file) => (
                    <li key={file.id} className="text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {file.title ?? file.filename_download}
                      </span>
                      <span className="font-mono text-[0.75rem]">
                        {" "}
                        · {file.filename_download}
                        {file.type ? ` · ${file.type}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {collections.map((col) => (
              <div key={col.collection}>
                <h3 className="text-sm font-medium text-foreground">
                  <code>{col.collection}</code>
                  <span className="ml-2 font-normal text-muted-foreground">
                    {col.count} item{col.count === 1 ? "" : "s"}
                  </span>
                </h3>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {col.items.map((item, i) => (
                    <li
                      key={item.id ?? `${col.collection}-${i}`}
                      className="flex flex-wrap items-baseline gap-x-2 gap-y-1"
                    >
                      <span className="text-foreground">{item.label}</span>
                      {item.slug ? (
                        <code className="text-[0.75rem] text-muted-foreground">
                          /{item.slug}
                        </code>
                      ) : null}
                      {item.status ? (
                        <Badge
                          variant="outline"
                          className="font-mono text-[0.65rem]"
                        >
                          {item.status}
                        </Badge>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
