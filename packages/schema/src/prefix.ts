import {
  normalizeCollectionPrefix,
  prefixedCollection,
} from "@dkit/shared";
import type { RestSchema } from "./apply-rest.js";
import type {
  FlowsBundle,
  PolicyBundle,
  SeedBundle,
} from "./types.js";

export function applyCollectionPrefixToRestSchema(
  schema: RestSchema,
  prefix: string,
): RestSchema {
  const p = normalizeCollectionPrefix(prefix);
  if (!p) return schema;

  const rename = (name: string) => prefixedCollection(name, p);

  return {
    ...schema,
    collections: schema.collections.map((col) => ({
      ...col,
      collection: rename(col.collection),
      meta: col.meta
        ? {
            ...col.meta,
            // Folder groups reference another collection name
            group:
              typeof col.meta.group === "string" && col.meta.group
                ? rename(col.meta.group)
                : col.meta.group,
          }
        : col.meta,
      fields: col.fields?.map((field) => {
        // relation-ish string fields that point at collection names are rare in field defs;
        // M2A one_allowed_collections live on relations.meta
        return field;
      }),
    })),
    relations: (schema.relations ?? []).map((rel) => ({
      ...rel,
      collection: rename(rel.collection),
      related_collection: rel.related_collection
        ? rename(rel.related_collection)
        : null,
      meta: rel.meta
        ? {
            ...rel.meta,
            many_collection: rel.meta.many_collection
              ? rename(String(rel.meta.many_collection))
              : rel.meta.many_collection,
            one_collection: rel.meta.one_collection
              ? rename(String(rel.meta.one_collection))
              : rel.meta.one_collection,
            one_allowed_collections: Array.isArray(
              rel.meta.one_allowed_collections,
            )
              ? (rel.meta.one_allowed_collections as string[]).map(rename)
              : rel.meta.one_allowed_collections,
          }
        : rel.meta,
      schema: rel.schema,
    })),
  };
}

export function applyCollectionPrefixToAccess(
  access: PolicyBundle,
  prefix: string,
): PolicyBundle {
  const p = normalizeCollectionPrefix(prefix);
  if (!p) return access;
  const rename = (name: string) => prefixedCollection(name, p);

  return {
    ...access,
    permissions: (access.permissions ?? []).map((perm) => ({
      ...perm,
      collection: rename(perm.collection),
    })),
  };
}

export function applyCollectionPrefixToFlows(
  flows: FlowsBundle,
  prefix: string,
): FlowsBundle {
  const p = normalizeCollectionPrefix(prefix);
  if (!p) return flows;
  const rename = (name: string) => prefixedCollection(name, p);

  return {
    ...flows,
    flows: (flows.flows ?? []).map((flow) => {
      const options = { ...(flow.options ?? {}) };
      if (Array.isArray(options.collections)) {
        options.collections = (options.collections as string[]).map(rename);
      }
      return { ...flow, options };
    }),
  };
}

export function applyCollectionPrefixToSeed(
  seed: SeedBundle,
  prefix: string,
): SeedBundle {
  const p = normalizeCollectionPrefix(prefix);
  if (!p) return seed;
  const rename = (name: string) => prefixedCollection(name, p);
  const items: Record<string, Record<string, unknown>[]> = {};
  for (const [collection, rows] of Object.entries(seed.items ?? {})) {
    items[rename(collection)] = rows;
  }
  return {
    // files are Directus system assets — never prefix; keep as-is
    files: seed.files,
    items,
  };
}

export function buildCollectionMap(
  logicalNames: string[],
  prefix: string,
): Record<string, string> {
  const p = normalizeCollectionPrefix(prefix);
  const map: Record<string, string> = {};
  for (const name of logicalNames) {
    map[name] = prefixedCollection(name, p);
  }
  return map;
}
