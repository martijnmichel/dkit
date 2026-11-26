import { compareSemver, majorVersion } from "@dkit/shared";
import type { DkitDirectusClient } from "./client.js";

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

async function fetchServerVersion(
  client: DkitDirectusClient,
  url: string,
): Promise<string> {
  // Prefer public server info
  try {
    const res = await fetch(new URL("/server/info", url).toString(), {
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const body = (await res.json()) as {
        data?: { directus?: { version?: string }; project?: { version?: string } };
        directus?: { version?: string };
      };
      const v =
        body.data?.directus?.version ??
        body.directus?.version ??
        body.data?.project?.version;
      if (v) return v;
    }
  } catch {
    // fall through
  }

  // Fallback: schema snapshot often includes directus version for admins
  try {
    const snap = await client.request(() => ({
      path: "/schema/snapshot",
      method: "GET",
      params: {},
    }));
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
