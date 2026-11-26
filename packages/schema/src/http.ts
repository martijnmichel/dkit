import type { DkitDirectusClient } from "./client.js";
import { toError } from "./errors.js";

export type HttpOpts = {
  path: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  params?: Record<string, unknown>;
  body?: unknown;
};

/** Typed escape hatch for Directus custom REST calls */
export async function http<T = unknown>(
  client: DkitDirectusClient,
  opts: HttpOpts,
): Promise<T> {
  try {
    return (await client.request((() => {
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
    }) as never)) as T;
  } catch (err) {
    throw toError(err, `${opts.method ?? "GET"} ${opts.path} failed`);
  }
}
