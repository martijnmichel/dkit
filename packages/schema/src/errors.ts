/** Format Directus SDK / REST failures into a readable Error. */
export function toError(err: unknown, fallback = "Directus request failed"): Error {
  if (err instanceof Error) {
    const nested = formatDirectusPayload(err);
    if (nested && nested !== err.message) {
      return new Error(`${err.message}: ${nested}`);
    }
    return err;
  }

  const fromPayload = formatDirectusPayload(err);
  if (fromPayload) return new Error(fromPayload);

  if (typeof err === "string" && err.trim()) return new Error(err);

  try {
    return new Error(JSON.stringify(err));
  } catch {
    return new Error(fallback);
  }
}

function formatDirectusPayload(err: unknown): string | null {
  if (!err || typeof err !== "object") return null;
  const obj = err as Record<string, unknown>;

  const errors = obj.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    return errors
      .map((e) => {
        if (!e || typeof e !== "object") return String(e);
        const item = e as Record<string, unknown>;
        const msg = typeof item.message === "string" ? item.message : null;
        const ext = item.extensions as Record<string, unknown> | undefined;
        const code = ext && typeof ext.code === "string" ? ext.code : null;
        const category =
          ext && typeof ext.category === "string" ? ext.category : null;
        const parts = [msg, code, category].filter(Boolean);
        return parts.join(" · ") || JSON.stringify(e);
      })
      .join("; ");
  }

  if (typeof obj.message === "string" && obj.message.trim()) {
    return obj.message;
  }

  return null;
}

/** True when Directus Core rejected custom permission filters / field subsets. */
export function isCustomPermissionRulesRestricted(err: unknown): boolean {
  const text = toError(err).message;
  return (
    text.includes("custom_permission_rules_enabled") ||
    text.includes("RESOURCE_RESTRICTED")
  );
}

/**
 * Directus 12 Core (no license) only allows flat permissions:
 * fields ["*"], no item filters / validation / presets.
 */
export function toCoreFlatPermission<T extends Record<string, unknown>>(
  perm: T,
): T & {
  fields: string[];
  permissions: null;
  validation: null;
  presets: null;
} {
  return {
    ...perm,
    fields: ["*"],
    permissions: null,
    validation: null,
    presets: null,
  };
}

export function permissionHasCustomRules(
  perm: Record<string, unknown>,
): boolean {
  const fields = perm.fields;
  if (Array.isArray(fields) && fields.some((f) => f !== "*")) return true;

  for (const key of ["permissions", "validation", "presets"] as const) {
    const v = perm[key];
    if (v == null) continue;
    if (typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0) {
      continue;
    }
    if (v !== null) return true;
  }
  return false;
}
