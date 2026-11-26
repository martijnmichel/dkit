import type { DkitDirectusClient } from "./client.js";

export type HttpOpts = {
  path: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  params?: Record<string, unknown>;
  body?: unknown;
};

/** Typed escape hatch for Directus custom REST calls */
export function http<T = unknown>(
  client: DkitDirectusClient,
  opts: HttpOpts,
): Promise<T> {
  return client.request((() => {
    const cmd: Record<string, unknown> = {
      path: opts.path,
      method: opts.method ?? "GET",
      params: opts.params ?? {},
    };
    if (opts.body !== undefined) {
      cmd.body = JSON.stringify(opts.body);
      cmd.headers = { "Content-Type": "application/json" };
    }
    return cmd;
  }) as never) as Promise<T>;
}
