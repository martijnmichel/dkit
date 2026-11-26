type DiffKind = { kind?: string; [key: string]: unknown };

type SchemaDiff = {
  hash?: string;
  diff?: {
    collections?: Array<{ collection?: string; diff?: DiffKind[] }>;
    fields?: Array<{ collection?: string; field?: string; diff?: DiffKind[] }>;
    relations?: Array<{
      collection?: string;
      field?: string;
      diff?: DiffKind[];
    }>;
  };
  [key: string]: unknown;
};

/** Remove deletion operations from a schema diff (for Directus < 12.2 mirror diffs). */
export function stripDeleteOperations(diffPayload: SchemaDiff): SchemaDiff {
  const diff = diffPayload.diff;
  if (!diff) return diffPayload;

  const filterOps = (ops?: DiffKind[]) =>
    (ops ?? []).filter((op) => op.kind !== "D");

  return {
    ...diffPayload,
    diff: {
      collections: (diff.collections ?? [])
        .map((c) => ({ ...c, diff: filterOps(c.diff) }))
        .filter((c) => (c.diff?.length ?? 0) > 0),
      fields: (diff.fields ?? [])
        .map((f) => ({ ...f, diff: filterOps(f.diff) }))
        .filter((f) => (f.diff?.length ?? 0) > 0),
      relations: (diff.relations ?? [])
        .map((r) => ({ ...r, diff: filterOps(r.diff) }))
        .filter((r) => (r.diff?.length ?? 0) > 0),
    },
  };
}

export function summarizeDiff(diffPayload: SchemaDiff): string[] {
  const lines: string[] = [];
  const d = diffPayload.diff;
  if (!d) {
    lines.push("No schema diff");
    return lines;
  }
  for (const c of d.collections ?? []) {
    lines.push(`collection ${c.collection}: ${(c.diff ?? []).map((x) => x.kind).join(",")}`);
  }
  for (const f of d.fields ?? []) {
    lines.push(
      `field ${f.collection}.${f.field}: ${(f.diff ?? []).map((x) => x.kind).join(",")}`,
    );
  }
  for (const r of d.relations ?? []) {
    lines.push(
      `relation ${r.collection}.${r.field}: ${(r.diff ?? []).map((x) => x.kind).join(",")}`,
    );
  }
  return lines;
}
