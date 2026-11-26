import { SchemaCollectionsAccordion } from "@/components/schema-collections";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RestSchemaDoc } from "@/lib/schema-docs";

export function SchemaReference({
  schema,
  access,
}: {
  schema?: RestSchemaDoc | null;
  access?: {
    policies?: Array<{ name: string; description?: string }>;
    permissions?: Array<{
      collection: string;
      action: string;
      fields?: string[] | null;
      permissions?: unknown;
      validation?: unknown;
    }>;
  } | null;
}) {
  const collections = schema?.collections ?? [];
  const relations = schema?.relations ?? [];

  return (
    <div className="space-y-8">
      <section id="schema" className="scroll-mt-24">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Schema
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Collections and fields from this module&apos;s{" "}
          <code className="font-mono">snapshot.json</code>
          {schema?.format ? (
            <>
              {" "}
              (<code className="font-mono">{schema.format}</code>)
            </>
          ) : null}
          . Names below are logical;{" "}
          <code className="font-mono">dkit add</code> applies your collection
          prefix.
        </p>
      </section>

      <SchemaCollectionsAccordion
        collections={collections}
        relations={relations}
      />

      {relations.length > 0 ? (
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base">All relations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {relations.map((r) => (
                <li
                  key={`${r.collection}.${r.field}.${r.related_collection}`}
                  className="font-mono text-[0.8125rem]"
                >
                  {r.collection}.{r.field} → {r.related_collection ?? "?"}
                  {r.schema?.on_delete ? (
                    <span className="text-muted-foreground">
                      {" "}
                      · on_delete {r.schema.on_delete}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <Card id="access" className="scroll-mt-24">
        <CardHeader className="pb-0">
          <CardTitle className="text-base">Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2 text-sm">
            {(access?.policies ?? []).map((p) => (
              <li key={p.name}>
                <strong>{p.name}</strong>
                {p.description ? (
                  <div className="text-muted-foreground">{p.description}</div>
                ) : null}
              </li>
            ))}
          </ul>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {(access?.permissions ?? []).map((p, i) => (
              <li key={i} className="font-mono text-[0.8125rem]">
                {p.action} → {p.collection}
                {p.fields?.length ? ` [${p.fields.join(", ")}]` : ""}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Requires Directus 11+ (12.2+ recommended). Prefer a staging project
        before running <code className="font-mono">dkit add</code> against
        production.
      </p>
    </div>
  );
}
