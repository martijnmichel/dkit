import type { DkitDirectusClient } from "./client.js";
import { http } from "./http.js";

export type RestField = {
  field: string;
  type: string;
  meta?: Record<string, unknown> | null;
  schema?: Record<string, unknown> | null;
};

export type RestCollection = {
  collection: string;
  meta?: Record<string, unknown> | null;
  schema?: Record<string, unknown> | null;
  fields?: RestField[];
};

export type RestRelation = {
  collection: string;
  field: string;
  related_collection: string | null;
  meta?: Record<string, unknown> | null;
  schema?: Record<string, unknown> | null;
};

export type RestSchema = {
  format: "dkit.rest";
  collections: RestCollection[];
  relations?: RestRelation[];
};

export function isRestSchema(value: unknown): value is RestSchema {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as RestSchema).format === "dkit.rest"
  );
}

export async function applyRestSchema(
  client: DkitDirectusClient,
  schema: RestSchema,
  options: {
    dryRun?: boolean;
    onLog?: (m: string) => void;
  },
): Promise<string[]> {
  const log = options.onLog ?? (() => undefined);
  const lines: string[] = [];

  const existing = await listCollections(client);
  const existingSet = new Set(existing);

  for (const col of schema.collections) {
    if (existingSet.has(col.collection)) {
      throw new Error(
        `Collection "${col.collection}" already exists. Remove it or use a fresh Directus instance.`,
      );
    }
    lines.push(`collection: create ${col.collection}`);
  }
  for (const rel of schema.relations ?? []) {
    lines.push(
      `relation: ${rel.collection}.${rel.field} → ${rel.related_collection}`,
    );
  }

  if (options.dryRun) return lines;

  for (const col of schema.collections) {
    log(`→ Creating collection ${col.collection}…`);
    const { fields, ...rest } = col;
    await http(client, {
      path: "/collections",
      method: "POST",
      body: { ...rest, fields: fields ?? [] },
    });
  }

  for (const rel of schema.relations ?? []) {
    log(`→ Creating relation ${rel.collection}.${rel.field}…`);
    await http(client, {
      path: "/relations",
      method: "POST",
      body: rel,
    });
  }

  log("✓ REST schema applied");
  return lines;
}

async function listCollections(client: DkitDirectusClient): Promise<string[]> {
  const res = await http<
    Array<{ collection: string }> | { data?: Array<{ collection: string }> }
  >(client, { path: "/collections", method: "GET" });
  const list = Array.isArray(res) ? res : (res.data ?? []);
  return list.map((c) => c.collection);
}
