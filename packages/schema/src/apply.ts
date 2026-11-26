import type { DkitDirectusClient } from "./client.js";
import { detectDirectusVersion } from "./version.js";
import { stripDeleteOperations, summarizeDiff } from "./strip-deletes.js";
import { applyRestSchema, isRestSchema, type RestSchema } from "./apply-rest.js";
import { http } from "./http.js";
import {
  isCustomPermissionRulesRestricted,
  permissionHasCustomRules,
  toCoreFlatPermission,
  toError,
} from "./errors.js";
import type {
  ApplyOptions,
  ApplyResult,
  FlowsBundle,
  PolicyBundle,
  SchemaSnapshot,
  SeedBundle,
} from "./types.js";

export type ModulePayload = {
  snapshot?: SchemaSnapshot | RestSchema;
  access?: PolicyBundle;
  flows?: FlowsBundle;
  seed?: SeedBundle;
  collections?: string[];
};

export async function applyModule(
  client: DkitDirectusClient,
  url: string,
  payload: ModulePayload,
  options: ApplyOptions = {},
): Promise<ApplyResult> {
  const log = options.onLog ?? (() => undefined);
  const warnings: string[] = [];
  const dryRunPlan: string[] = [];
  const result: ApplyResult = {
    schemaApplied: false,
    policiesApplied: false,
    flowsApplied: false,
    seedApplied: false,
    warnings,
    dryRunPlan,
  };

  const versionInfo = await detectDirectusVersion(client, url);
  if (!versionInfo.supported) {
    throw new Error(
      `Directus ${versionInfo.version} is not supported. dkit requires Directus 11+.`,
    );
  }

  if (!versionInfo.supportsMergeMode) {
    const msg = `Directus ${versionInfo.version} lacks schema diff mode=merge (needs 12.2+). Using safer strip-deletes fallback.`;
    warnings.push(msg);
    log(`⚠ ${msg}`);
    if (!options.dryRun && !options.confirmReducedSafety) {
      throw new Error(
        `${msg} Re-run with --yes to continue on this version.`,
      );
    }
  } else {
    log(`✓ Directus ${versionInfo.version} (merge-mode schema apply)`);
  }

  if (payload.snapshot) {
    if (isRestSchema(payload.snapshot)) {
      const lines = await applyRestSchema(client, payload.snapshot, {
        dryRun: options.dryRun,
        onLog: log,
      });
      dryRunPlan.push(...lines);
      result.schemaApplied = !options.dryRun && lines.length > 0;
    } else {
      const plan = await planAndApplySchema(
        client,
        payload.snapshot,
        versionInfo.supportsMergeMode,
        options,
        log,
      );
      dryRunPlan.push(...plan.lines);
      result.schemaApplied = plan.applied;
    }
  }

  if (payload.access) {
    const plan = await applyAccess(client, payload.access, options, log);
    dryRunPlan.push(...plan.lines);
    result.policiesApplied = plan.applied;
  }

  if (payload.flows?.flows?.length) {
    const plan = await applyFlows(client, payload.flows, options, log);
    dryRunPlan.push(...plan.lines);
    result.flowsApplied = plan.applied;
  }

  if (
    options.seed &&
    payload.seed &&
    ((payload.seed.files?.length ?? 0) > 0 ||
      Object.keys(payload.seed.items ?? {}).length > 0)
  ) {
    const plan = await applySeed(client, url, payload.seed, options, log);
    dryRunPlan.push(...plan.lines);
    result.seedApplied = plan.applied;
  }

  return result;
}

async function planAndApplySchema(
  client: DkitDirectusClient,
  snapshot: SchemaSnapshot,
  supportsMerge: boolean,
  options: ApplyOptions,
  log: (m: string) => void,
): Promise<{ applied: boolean; lines: string[] }> {
  const lines: string[] = [];
  log("→ Diffing schema…");

  const diffBody = await http(client, {
    path: "/schema/diff",
    method: "POST",
    params: supportsMerge
      ? { mode: "merge", force: options.forceSchema ? true : undefined }
      : { force: true },
    body: snapshot,
  });

  let diffPayload =
    (diffBody as { data?: unknown })?.data ?? diffBody;

  if (!supportsMerge) {
    diffPayload = stripDeleteOperations(diffPayload as never);
  }

  const summary = summarizeDiff(diffPayload as never);
  if (
    summary.length === 0 ||
    (summary.length === 1 && summary[0] === "No schema diff")
  ) {
    lines.push("schema: no changes");
    log("✓ Schema already up to date");
    return { applied: false, lines };
  }

  lines.push(...summary.map((s) => `schema: ${s}`));
  if (options.dryRun) return { applied: false, lines };

  log("→ Applying schema…");
  await http(client, {
    path: "/schema/apply",
    method: "POST",
    params: options.forceSchema ? { force: true } : {},
    body: diffPayload,
  });
  log("✓ Schema applied");
  return { applied: true, lines };
}

async function applyAccess(
  client: DkitDirectusClient,
  access: PolicyBundle,
  options: ApplyOptions,
  log: (m: string) => void,
): Promise<{ applied: boolean; lines: string[] }> {
  const lines: string[] = [];
  const policies = access.policies ?? [];
  const permissions = access.permissions ?? [];

  for (const policy of policies) {
    lines.push(`policy: upsert ${policy.name}`);
  }
  for (const perm of permissions) {
    lines.push(
      `permission: ${perm.action} on ${perm.collection} (${perm.policy ?? "policy"})`,
    );
  }

  if (options.dryRun) return { applied: false, lines };

  // fields must be a comma string — array form can return an incomplete policy list on Directus 12
  const existing = await http<
    { data?: Array<{ id: string; name: string }> } | Array<{ id: string; name: string }>
  >(client, {
    path: "/policies",
    method: "GET",
    params: { limit: -1, fields: "id,name" },
  });

  const list = Array.isArray(existing) ? existing : (existing.data ?? []);
  const byName = new Map(list.map((p) => [p.name, p.id]));
  const policyIds = new Map<string, string>();

  for (const policy of policies) {
    const existingId = byName.get(policy.name);
    if (existingId) {
      log(`→ Reusing existing policy ${policy.name}`);
      policyIds.set(policy.name, existingId);
      continue;
    }
    log(`→ Creating policy ${policy.name}…`);
    const created = await http<{ data?: { id: string }; id?: string }>(client, {
      path: "/policies",
      method: "POST",
      body: policy,
    });
    const id = created.data?.id ?? created.id;
    if (!id) throw new Error(`Failed to create policy ${policy.name}`);
    policyIds.set(policy.name, id);
    byName.set(policy.name, id);
  }

  let warnedCoreFlat = false;

  for (const perm of permissions) {
    const policyRef = perm.policy;
    const policyId =
      (policyRef && policyIds.get(policyRef)) ||
      (policyRef && byName.get(policyRef)) ||
      policyRef;
    if (!policyId) {
      throw new Error(
        `Permission for ${perm.collection}/${perm.action} references unknown policy "${policyRef}"`,
      );
    }
    const { policy: _p, ...rest } = perm;
    const body = { ...rest, policy: policyId };

    try {
      await http(client, {
        path: "/permissions",
        method: "POST",
        body,
      });
    } catch (err) {
      if (
        isCustomPermissionRulesRestricted(err) ||
        permissionHasCustomRules(rest as Record<string, unknown>)
      ) {
        if (!warnedCoreFlat) {
          log(
            "⚠ Directus Core blocks custom permission rules (row filters / field subsets). Using flat fields:['*'] — UI should filter published status. Add a Directus license for server-side filters.",
          );
          warnedCoreFlat = true;
        }
        try {
          await http(client, {
            path: "/permissions",
            method: "POST",
            body: toCoreFlatPermission(body as Record<string, unknown>),
          });
        } catch (flatErr) {
          throw toError(
            flatErr,
            `Failed to create flat permission on ${perm.collection}/${perm.action}`,
          );
        }
        continue;
      }
      throw toError(
        err,
        `Failed to create permission on ${perm.collection}/${perm.action}`,
      );
    }
  }

  for (const row of access.access ?? []) {
    const policyId =
      policyIds.get(row.policy) ?? byName.get(row.policy) ?? row.policy;
    // Directus 12: public = access row with role=null + user=null (no Public role entity)
    const role = row.role === "$public" ? null : (row.role ?? null);
    const user = row.role === "$public" ? null : (row.user ?? null);
    try {
      await http(client, {
        path: "/access",
        method: "POST",
        body: { role, user, policy: policyId, sort: row.sort ?? null },
      });
    } catch (err) {
      // Already linked is fine on re-run
      const msg = toError(err).message.toLowerCase();
      if (msg.includes("unique") || msg.includes("already")) {
        log(`→ Access link already exists for ${row.policy}`);
        continue;
      }
      throw toError(err, `Failed to link access for policy ${row.policy}`);
    }
  }

  log("✓ Access policies applied");
  return { applied: true, lines };
}

async function applyFlows(
  client: DkitDirectusClient,
  flows: FlowsBundle,
  options: ApplyOptions,
  log: (m: string) => void,
): Promise<{ applied: boolean; lines: string[] }> {
  const lines: string[] = [];
  for (const flow of flows.flows ?? []) {
    lines.push(`flow: create ${flow.name}`);
  }
  if (options.dryRun) return { applied: false, lines };

  const existing = await http<
    { data?: Array<{ id: string; name: string }> } | Array<{ id: string; name: string }>
  >(client, {
    path: "/flows",
    method: "GET",
    params: { limit: -1, fields: ["id", "name"] },
  });
  const list = Array.isArray(existing) ? existing : (existing.data ?? []);
  const names = new Set(list.map((f) => f.name));

  for (const flow of flows.flows ?? []) {
    if (names.has(flow.name)) {
      throw new Error(
        `Flow "${flow.name}" already exists. Remove it or rename, then re-run.`,
      );
    }
    const { id: _id, ...rest } = flow;
    await http(client, { path: "/flows", method: "POST", body: rest });
  }

  for (const op of flows.operations ?? []) {
    await http(client, { path: "/operations", method: "POST", body: op });
  }

  log("✓ Flows applied");
  return { applied: true, lines };
}

async function applySeed(
  client: DkitDirectusClient,
  url: string,
  seed: SeedBundle,
  options: ApplyOptions,
  log: (m: string) => void,
): Promise<{ applied: boolean; lines: string[] }> {
  const lines: string[] = [];
  if (seed.files?.length) {
    lines.push(`seed: ${seed.files.length} file(s)`);
  }
  for (const [collection, items] of Object.entries(seed.items ?? {})) {
    lines.push(`seed: ${items.length} item(s) → ${collection}`);
  }
  if (options.dryRun) return { applied: false, lines };

  // Directus usually assigns its own file UUIDs — map seed ids → actual ids
  const fileIdMap = new Map<string, string>();
  for (const file of seed.files ?? []) {
    try {
      const { id: actualId, created } = await upsertSeedFile(client, url, file);
      fileIdMap.set(file.id, actualId);
      if (created) {
        log(
          actualId === file.id
            ? `→ Seed uploaded file ${actualId}`
            : `→ Seed uploaded file ${file.filename_download} → ${actualId}`,
        );
      } else {
        log(`→ Seed reused file ${actualId}`);
      }
    } catch (err) {
      throw wrapSeedError(`upload file ${file.filename_download}`, err);
    }
  }

  for (const [collection, items] of Object.entries(seed.items ?? {})) {
    for (const item of items) {
      const remapped = remapSeedFileRefs(item, fileIdMap);
      const label =
        typeof remapped.id === "string" || typeof remapped.id === "number"
          ? `${collection}/${remapped.id}`
          : collection;
      try {
        const outcome = await upsertSeedItem(client, collection, remapped);
        if (outcome === "created") log(`→ Seed created ${label}`);
        else if (outcome === "updated") log(`→ Seed updated ${label}`);
        else log(`→ Seed skipped ${label} (already exists)`);
      } catch (err) {
        throw wrapSeedError(`upsert ${label}`, err);
      }
    }
  }
  log("✓ Seed data applied");
  return { applied: true, lines };
}

function wrapSeedError(step: string, err: unknown): Error {
  const msg = err instanceof Error ? err.message : String(err);
  return new Error(`Seed ${step} failed: ${msg}`);
}

function remapSeedFileRefs(
  item: Record<string, unknown>,
  fileIdMap: Map<string, string>,
): Record<string, unknown> {
  if (fileIdMap.size === 0) return item;
  const next: Record<string, unknown> = { ...item };
  for (const [key, value] of Object.entries(next)) {
    if (typeof value === "string" && fileIdMap.has(value)) {
      next[key] = fileIdMap.get(value);
    }
  }
  return next;
}

async function upsertSeedFile(
  client: DkitDirectusClient,
  url: string,
  file: NonNullable<SeedBundle["files"]>[number],
): Promise<{ id: string; created: boolean }> {
  // Prefer stable seed id when Directus accepted it on a prior run
  if (await seedFileExists(client, file.id)) {
    return { id: file.id, created: false };
  }

  const byName = await findSeedFileByFilename(client, file.filename_download);
  if (byName) return { id: byName, created: false };

  const token =
    typeof client.getToken === "function" ? await client.getToken() : null;
  if (!token) {
    throw new Error(
      "Cannot upload seed files: Directus client has no static token.",
    );
  }

  if (!file.data_base64) {
    throw new Error(
      `Seed file ${file.filename_download} has no data_base64 (path not resolved).`,
    );
  }
  const bytes = Buffer.from(file.data_base64, "base64");
  const blob = new Blob([bytes], {
    type: file.type ?? "application/octet-stream",
  });
  const form = new FormData();
  // Hint only — many Directus versions ignore this and mint their own UUID
  form.append("id", file.id);
  form.append("title", file.title ?? file.filename_download);
  form.append("file", blob, file.filename_download);

  const base = url.replace(/\/$/, "");
  const res = await fetch(`${base}/files`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Seed file upload failed (${res.status}): ${text}`);
  }

  const payload = (await res.json()) as {
    data?: { id?: string };
    id?: string;
  };
  const actualId = payload.data?.id ?? payload.id;
  if (!actualId) {
    throw new Error(
      `Seed file upload returned no id for ${file.filename_download}`,
    );
  }
  return { id: actualId, created: true };
}

async function seedFileExists(
  client: DkitDirectusClient,
  id: string,
): Promise<boolean> {
  try {
    await http(client, {
      path: `/files/${id}`,
      method: "GET",
      params: { fields: "id" },
    });
    return true;
  } catch (err) {
    // Directus often returns FORBIDDEN (not 404) for missing files
    if (isNotFound(err) || isForbidden(err)) return false;
    throw err;
  }
}

async function findSeedFileByFilename(
  client: DkitDirectusClient,
  filename: string,
): Promise<string | null> {
  try {
    const res = await http<
      Array<{ id: string }> | { data?: Array<{ id: string }> }
    >(client, {
      path: "/files",
      method: "GET",
      params: {
        limit: 1,
        fields: "id",
        // SDK expects filter as a JSON string
        filter: JSON.stringify({ filename_download: { _eq: filename } }),
      },
    });
    const list = Array.isArray(res) ? res : (res.data ?? []);
    return list[0]?.id ?? null;
  } catch {
    return null;
  }
}

/** Create-or-update seed rows so `dkit add --seed` is safe to re-run. */
async function upsertSeedItem(
  client: DkitDirectusClient,
  collection: string,
  item: Record<string, unknown>,
): Promise<"created" | "updated" | "skipped"> {
  const id = item.id;
  if (typeof id === "string" || typeof id === "number") {
    const exists = await seedItemExists(client, collection, id);
    if (exists) {
      const { id: _id, ...rest } = item;
      await http(client, {
        path: `/items/${collection}/${id}`,
        method: "PATCH",
        body: rest,
      });
      return "updated";
    }
    await http(client, {
      path: `/items/${collection}`,
      method: "POST",
      body: item,
    });
    return "created";
  }

  // Junction / rows without a stable id — skip when matching scalars already exist
  if (await seedItemMatches(client, collection, item)) {
    return "skipped";
  }

  try {
    await http(client, {
      path: `/items/${collection}`,
      method: "POST",
      body: item,
    });
    return "created";
  } catch (err) {
    if (isUniqueViolation(err)) return "skipped";
    throw err;
  }
}

/** True when a row already matches all scalar fields (e.g. M2M junction). */
async function seedItemMatches(
  client: DkitDirectusClient,
  collection: string,
  item: Record<string, unknown>,
): Promise<boolean> {
  const filter: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(item)) {
    if (value === null || value === undefined) continue;
    if (typeof value === "object") continue;
    filter[key] = { _eq: value };
  }
  if (Object.keys(filter).length === 0) return false;

  try {
    const res = await http<
      Array<{ id?: string | number }> | { data?: Array<{ id?: string | number }> }
    >(client, {
      path: `/items/${collection}`,
      method: "GET",
      params: {
        limit: 1,
        fields: "id",
        filter: JSON.stringify(filter),
      },
    });
    const list = Array.isArray(res) ? res : (res.data ?? []);
    return list.length > 0;
  } catch {
    return false;
  }
}

async function seedItemExists(
  client: DkitDirectusClient,
  collection: string,
  id: string | number,
): Promise<boolean> {
  try {
    await http(client, {
      path: `/items/${collection}/${id}`,
      method: "GET",
      params: { fields: "id" },
    });
    return true;
  } catch (err) {
    // Missing rows can surface as FORBIDDEN depending on permissions
    if (isNotFound(err) || isForbidden(err)) return false;
    throw err;
  }
}

function isNotFound(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    /\b404\b/.test(msg) ||
    /RECORD_NOT_FOUND/i.test(msg) ||
    /doesn't exist/i.test(msg) ||
    /does not exist/i.test(msg)
  );
}

function isForbidden(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /\b403\b/.test(msg) || /FORBIDDEN/i.test(msg);
}

function isUniqueViolation(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /RECORD_NOT_UNIQUE/i.test(msg) || /has to be unique/i.test(msg);
}
