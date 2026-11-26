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

  if (options.seed && payload.seed?.items) {
    const plan = await applySeed(client, payload.seed, options, log);
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
  seed: SeedBundle,
  options: ApplyOptions,
  log: (m: string) => void,
): Promise<{ applied: boolean; lines: string[] }> {
  const lines: string[] = [];
  for (const [collection, items] of Object.entries(seed.items ?? {})) {
    lines.push(`seed: ${items.length} item(s) → ${collection}`);
  }
  if (options.dryRun) return { applied: false, lines };

  for (const [collection, items] of Object.entries(seed.items ?? {})) {
    for (const item of items) {
      await http(client, {
        path: `/items/${collection}`,
        method: "POST",
        body: item,
      });
    }
  }
  log("✓ Seed data applied");
  return { applied: true, lines };
}
