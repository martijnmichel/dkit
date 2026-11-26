import { compareSemver, majorVersion } from "@dkit/shared";
import type { DkitDirectusClient } from "./client.js";
import { http } from "./http.js";

export type DirectusVersionInfo = {
  version: string;
  major: number;
  supportsMergeMode: boolean;
  /** Below Directus 11 is unsupported */
  supported: boolean;
};

const MERGE_MODE_MIN = "12.2.0";
const MIN_SUPPORTED = "11.0.0";

export async function detectDirectusVersion(
  client: DkitDirectusClient,
  url: string,
): Promise<DirectusVersionInfo> {
  const version = await fetchServerVersion(client, url);
  const major = majorVersion(version);
  return {
    version,
    major,
    supportsMergeMode: compareSemver(version, MERGE_MODE_MIN) >= 0,
    supported: compareSemver(version, MIN_SUPPORTED) >= 0 && major >= 11,
  };
}

function pickVersion(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const root = body as Record<string, unknown>;
  const data = (root.data ?? root) as Record<string, unknown>;
  const candidates = [
    data.version,
    root.version,
    typeof data.directus === "string" ? data.directus : (data.directus as { version?: string } | undefined)?.version,
    typeof root.directus === "string" ? root.directus : (root.directus as { version?: string } | undefined)?.version,
    (data.project as { version?: string } | undefined)?.version,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && /^\d+\.\d+/.test(c)) return c;
  }
  return null;
}

async function fetchServerVersion(
  client: DkitDirectusClient,
  url: string,
): Promise<string> {
  // Authenticated server info (version is often omitted on the public response)
  try {
    const body = await http(client, { path: "/server/info", method: "GET" });
    const v = pickVersion(body);
    if (v) return v;
  } catch {
    // fall through
  }

  // Public fetch
  try {
    const res = await fetch(new URL("/server/info", url).toString(), {
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const v = pickVersion(await res.json());
      if (v) return v;
    }
  } catch {
    // fall through
  }

  // Fallback: schema snapshot often includes directus version for admins
  try {
    const snap = await http(client, {
      path: "/schema/snapshot",
      method: "GET",
    });
    const version =
      (snap as { directus?: string })?.directus ??
      (snap as { data?: { directus?: string } })?.data?.directus;
    if (version) return version;
  } catch {
    // ignore
  }

  throw new Error(
    `Could not detect Directus version at ${url}. Is the instance reachable?`,
  );
}
