import { expandMetaTranslations } from "@dkit/shared";
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
  const prepared = expandRestSchemaTranslations(schema);

  const existing = await listCollections(client);
  const existingSet = new Set(existing);

  for (const col of prepared.collections) {
    if (existingSet.has(col.collection)) {
      lines.push(`collection: update meta ${col.collection}`);
    } else {
      lines.push(`collection: create ${col.collection}`);
    }
  }
  for (const rel of prepared.relations ?? []) {
    lines.push(
      `relation: ${rel.collection}.${rel.field} → ${rel.related_collection}`,
    );
  }

  if (options.dryRun) return lines;

  // Create folder groups first (schema: null), then tables
  const ordered = [...prepared.collections].sort((a, b) => {
    const aFolder = a.schema === null ? 0 : 1;
    const bFolder = b.schema === null ? 0 : 1;
    return aFolder - bFolder;
  });

  for (const col of ordered) {
    if (existingSet.has(col.collection)) {
      log(`→ Updating collection meta ${col.collection}…`);
      await updateCollectionMeta(client, col);
      await upsertFields(client, col, log);
      continue;
    }

    log(`→ Creating collection ${col.collection}…`);
    const { fields, ...rest } = col;
    await http(client, {
      path: "/collections",
      method: "POST",
      body: { ...rest, fields: fields ?? [] },
    });
    existingSet.add(col.collection);
  }

  const existingRelations = await listRelationKeys(client);
  for (const rel of prepared.relations ?? []) {
    const key = `${rel.collection}.${rel.field}`;
    if (existingRelations.has(key)) {
      log(`→ Relation ${key} already exists — skipping`);
      continue;
    }
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

/** Expand en-US translations on every collection/field to DKIT_LOCALES. */
export function expandRestSchemaTranslations(schema: RestSchema): RestSchema {
  return {
    ...schema,
    collections: schema.collections.map((col) => ({
      ...col,
      meta: expandMetaTranslations(
        col.meta as Record<string, unknown> | null | undefined,
      ) as RestCollection["meta"],
      fields: col.fields?.map((field) => ({
        ...field,
        meta: expandMetaTranslations(
          field.meta as Record<string, unknown> | null | undefined,
        ) as RestField["meta"],
      })),
    })),
  };
}

async function updateCollectionMeta(
  client: DkitDirectusClient,
  col: RestCollection,
): Promise<void> {
  if (!col.meta) return;
  await http(client, {
    path: `/collections/${col.collection}`,
    method: "PATCH",
    body: { meta: col.meta },
  });
}

async function upsertFields(
  client: DkitDirectusClient,
  col: RestCollection,
  log: (m: string) => void,
): Promise<void> {
  if (!col.fields?.length) return;
  const existingFields = await listFieldNames(client, col.collection);
  for (const field of col.fields) {
    if (existingFields.has(field.field)) {
      log(`→ Updating field ${col.collection}.${field.field}…`);
      await http(client, {
        path: `/fields/${col.collection}/${field.field}`,
        method: "PATCH",
        body: {
          meta: field.meta ?? undefined,
          // Don't patch schema on existing columns unless needed — avoid type fights
        },
      });
    } else {
      log(`→ Creating field ${col.collection}.${field.field}…`);
      await http(client, {
        path: `/fields/${col.collection}`,
        method: "POST",
        body: field,
      });
    }
  }
}

async function listCollections(client: DkitDirectusClient): Promise<string[]> {
  const res = await http<
    Array<{ collection: string }> | { data?: Array<{ collection: string }> }
  >(client, { path: "/collections", method: "GET" });
  const list = Array.isArray(res) ? res : (res.data ?? []);
  return list.map((c) => c.collection);
}

async function listFieldNames(
  client: DkitDirectusClient,
  collection: string,
): Promise<Set<string>> {
  const res = await http<
    Array<{ field: string }> | { data?: Array<{ field: string }> }
  >(client, { path: `/fields/${collection}`, method: "GET" });
  const list = Array.isArray(res) ? res : (res.data ?? []);
  return new Set(list.map((f) => f.field));
}

async function listRelationKeys(
  client: DkitDirectusClient,
): Promise<Set<string>> {
  try {
    const res = await http<
      | Array<{ collection: string; field: string }>
      | { data?: Array<{ collection: string; field: string }> }
    >(client, { path: "/relations", method: "GET" });
    const list = Array.isArray(res) ? res : (res.data ?? []);
    return new Set(list.map((r) => `${r.collection}.${r.field}`));
  } catch {
    return new Set();
  }
}
