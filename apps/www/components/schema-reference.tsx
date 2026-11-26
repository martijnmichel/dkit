import {
  enLabel,
  fieldFlags,
  formatChoices,
  type RestSchemaDoc,
  type SchemaCollection,
  type SchemaField,
  type SchemaRelation,
} from "@/lib/schema-docs";

function CollectionMeta({ collection }: { collection: SchemaCollection }) {
  const meta = collection.meta;
  const isFolder = collection.schema === null;
  const label = enLabel(meta?.translations, collection.collection);

  const rows: Array<[string, string]> = [
    ["Key", collection.collection],
    ["Label", label],
  ];
  if (isFolder) rows.push(["Kind", "folder (no table)"]);
  if (meta?.icon) rows.push(["Icon", meta.icon]);
  if (meta?.color) rows.push(["Color", meta.color]);
  if (meta?.group) rows.push(["Group", meta.group]);
  if (meta?.display_template) rows.push(["Display", meta.display_template]);
  if (meta?.archive_field) {
    rows.push([
      "Archive",
      `${meta.archive_field}: ${meta.archive_value ?? "?"} ↔ ${meta.unarchive_value ?? "?"}`,
    ]);
  }
  if (meta?.singleton) rows.push(["Singleton", "yes"]);
  if (meta?.note) rows.push(["Note", meta.note]);

  return (
    <dl className="grid gap-2 text-sm sm:grid-cols-[8rem_1fr]">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted">{k}</dt>
          <dd className="font-mono text-[0.8125rem] break-all">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function FieldRow({ field }: { field: SchemaField }) {
  const label = enLabel(field.meta?.translations, field.field);
  const flags = fieldFlags(field);
  const choices = formatChoices(field.meta);
  const conditions = field.meta?.conditions?.length
    ? field.meta.conditions.map((c) => c.name ?? "condition").join(", ")
    : null;

  return (
    <tr className="border-t border-[var(--border)] align-top">
      <td className="py-2.5 pr-3 font-mono text-[0.8125rem]">
        <div>{field.field}</div>
        {label !== field.field ? (
          <div className="text-muted font-sans text-xs">{label}</div>
        ) : null}
      </td>
      <td className="py-2.5 pr-3 font-mono text-[0.8125rem] text-muted">
        {field.type ?? "—"}
      </td>
      <td className="py-2.5 pr-3 font-mono text-[0.8125rem] text-muted">
        {field.meta?.interface ?? "—"}
        {field.meta?.width ? (
          <span className="text-muted"> · {field.meta.width}</span>
        ) : null}
      </td>
      <td className="py-2.5 text-xs leading-relaxed">
        <div className="flex flex-wrap gap-1">
          {flags.map((f) => (
            <span key={f} className="badge font-mono">
              {f}
            </span>
          ))}
        </div>
        {choices ? (
          <div className="text-muted mt-1 font-mono">{choices}</div>
        ) : null}
        {field.schema?.default_value != null ? (
          <div className="text-muted mt-1 font-mono">
            default: {JSON.stringify(field.schema.default_value)}
          </div>
        ) : null}
        {field.meta?.validation ? (
          <div className="text-muted mt-1">
            validation
            {field.meta.validation_message
              ? `: ${field.meta.validation_message}`
              : ""}
          </div>
        ) : null}
        {conditions ? (
          <div className="text-muted mt-1">conditions: {conditions}</div>
        ) : null}
        {field.meta?.note ? (
          <div className="text-muted mt-1">{field.meta.note}</div>
        ) : null}
      </td>
    </tr>
  );
}

function RelationsList({
  collection,
  relations,
}: {
  collection: string;
  relations: SchemaRelation[];
}) {
  const related = relations.filter((r) => r.collection === collection);
  if (!related.length) return null;
  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium">Relations</h4>
      <ul className="mt-2 space-y-1 text-sm">
        {related.map((r) => (
          <li key={`${r.collection}.${r.field}`} className="font-mono text-[0.8125rem]">
            {r.field} → {r.related_collection ?? "?"}
            {r.schema?.on_delete ? (
              <span className="text-muted"> · on_delete {r.schema.on_delete}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SchemaReference({
  schema,
  access,
  flows,
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
  flows?: { flows?: Array<{ name: string; description?: string; status?: string }> } | null;
}) {
  const collections = schema?.collections ?? [];
  const relations = schema?.relations ?? [];

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold tracking-tight">Schema</h2>
        <p className="text-muted mt-1 text-sm">
          From the module <code className="font-mono">snapshot.json</code>
          {schema?.format ? (
            <>
              {" "}
              (<code className="font-mono">{schema.format}</code>)
            </>
          ) : null}
          . Collection names are logical; your prefix is applied at install.
        </p>
      </section>

      {collections.map((collection) => {
        const fields = [...(collection.fields ?? [])].sort(
          (a, b) => (a.meta?.sort ?? 0) - (b.meta?.sort ?? 0),
        );
        const title = enLabel(
          collection.meta?.translations,
          collection.collection,
        );
        return (
          <section key={collection.collection} className="card">
            <h3 className="text-lg font-medium tracking-tight">
              <span className="font-mono text-base">{collection.collection}</span>
              {title !== collection.collection ? (
                <span className="text-muted font-sans text-sm"> · {title}</span>
              ) : null}
            </h3>
            <div className="mt-4">
              <CollectionMeta collection={collection} />
            </div>
            {fields.length > 0 ? (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
                  <thead>
                    <tr className="text-muted text-xs uppercase tracking-wide">
                      <th className="pb-2 pr-3 font-medium">Field</th>
                      <th className="pb-2 pr-3 font-medium">Type</th>
                      <th className="pb-2 pr-3 font-medium">Interface</th>
                      <th className="pb-2 font-medium">Setup</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((field) => (
                      <FieldRow key={field.field} field={field} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            <RelationsList
              collection={collection.collection}
              relations={relations}
            />
          </section>
        );
      })}

      {relations.length > 0 ? (
        <section className="card">
          <h3 className="font-medium">All relations</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {relations.map((r) => (
              <li
                key={`${r.collection}.${r.field}.${r.related_collection}`}
                className="font-mono text-[0.8125rem]"
              >
                {r.collection}.{r.field} → {r.related_collection ?? "?"}
                {r.schema?.on_delete ? (
                  <span className="text-muted">
                    {" "}
                    · on_delete {r.schema.on_delete}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="card">
        <h3 className="font-medium">Access</h3>
        <ul className="mt-4 space-y-2 text-sm">
          {(access?.policies ?? []).map((p) => (
            <li key={p.name}>
              <strong>{p.name}</strong>
              {p.description ? (
                <div className="text-muted">{p.description}</div>
              ) : null}
            </li>
          ))}
        </ul>
        <ul className="mt-4 space-y-1 text-sm text-muted">
          {(access?.permissions ?? []).map((p, i) => (
            <li key={i} className="font-mono text-[0.8125rem]">
              {p.action} → {p.collection}
              {p.fields?.length ? ` [${p.fields.join(", ")}]` : ""}
            </li>
          ))}
        </ul>
      </section>

      {(flows?.flows?.length ?? 0) > 0 ? (
        <section className="card">
          <h3 className="font-medium">Flows</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {flows!.flows!.map((f) => (
              <li key={f.name}>
                <strong>{f.name}</strong>
                {f.status ? (
                  <span className="text-muted font-mono text-xs">
                    {" "}
                    · {f.status}
                  </span>
                ) : null}
                {f.description ? (
                  <div className="text-muted">{f.description}</div>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="text-sm text-muted">
        Requires Directus 11+ (best on 12.2+). Back up or use a staging instance
        before <code className="font-mono">dkit add</code>.
      </p>
    </div>
  );
}
