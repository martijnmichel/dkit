/** Authoring shim — installed apps use generated lib/dkit/client.ts */
export type DirectusFileRef = { id: string };

type DirectusClient = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  request: <T = any>(...args: unknown[]) => Promise<T>;
};

export function getDirectus(): DirectusClient | null {
  return null;
}

export function dkitQueryFailed(_context: string, _err?: unknown): void {
  // no-op in registry authoring shim
}

export function directusFileId(
  value: string | DirectusFileRef | null | undefined,
): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.id ?? null;
}

export function directusAssetUrl(fileId: string): string | null {
  return fileId ? `/assets/${fileId}` : null;
}

export function createItem(..._args: unknown[]): unknown {
  return undefined;
}

export function readItem(..._args: unknown[]): unknown {
  return undefined;
}

export function readItems(..._args: unknown[]): unknown {
  return undefined;
}

export function readSingleton(..._args: unknown[]): unknown {
  return undefined;
}
