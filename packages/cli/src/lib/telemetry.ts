/**
 * Anonymous CLI usage → Umami (same host as www).
 *
 * Opt out: DO_NOT_TRACK=1, DKIT_TELEMETRY=0, or --no-telemetry.
 * Never sends paths, tokens, URLs, or other project contents.
 */

const DEFAULT_HOST = "https://analytics.kurbo.dev";
const DEFAULT_WEBSITE_ID = "5c426473-3bf1-49eb-abab-f5f0c7e57a25";

export type TelemetryProps = Record<
  string,
  string | number | boolean | undefined | null
>;

let disabledByFlag = false;
let pending: Promise<void> | null = null;

export function setTelemetryDisabled(disabled: boolean): void {
  disabledByFlag = disabled;
}

function envDisabled(): boolean {
  if (disabledByFlag) return true;
  const dnt = process.env.DO_NOT_TRACK ?? process.env.DO_NOT_TRACK_DNT;
  if (dnt === "1" || dnt === "true" || dnt === "yes") return true;
  const flag = process.env.DKIT_TELEMETRY;
  if (flag === "0" || flag === "false" || flag === "no") return true;
  if (process.env.DKIT_NO_TELEMETRY === "1") return true;
  return false;
}

function hostUrl(): string {
  return (
    process.env.DKIT_UMAMI_URL?.replace(/\/$/, "") ||
    DEFAULT_HOST
  );
}

function websiteId(): string {
  return process.env.DKIT_UMAMI_WEBSITE_ID || DEFAULT_WEBSITE_ID;
}

function sanitize(
  data: TelemetryProps,
): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "string" && v.length > 64) {
      out[k] = v.slice(0, 64);
      continue;
    }
    out[k] = v;
  }
  return out;
}

/** Queue a custom event; never throws; flushed before process exit. */
export function trackCliEvent(
  name: string,
  data: TelemetryProps = {},
): void {
  if (envDisabled()) return;
  if (!websiteId()) return;

  const eventName = name.slice(0, 50);
  const version = String(data.version ?? "0.1.0");
  const payload = {
    type: "event",
    payload: {
      website: websiteId(),
      hostname: "cli.dkit.run",
      language: Intl.DateTimeFormat().resolvedOptions().locale || "en-US",
      url: `/cli/${eventName}`,
      title: `dkit ${eventName}`,
      name: eventName,
      data: sanitize({ ...data, version }),
    },
  };

  const send = (async () => {
    try {
      // Umami (and/or the edge in front of analytics.kurbo.dev) ignores
      // non-browser User-Agents with a fake 200 {"beep":"boop"}. Keep a
      // Mozilla UA and identify the CLI in the product token.
      await fetch(`${hostUrl()}/api/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": `Mozilla/5.0 (compatible; dkit-cli/${version})`,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(1500),
      });
    } catch {
      /* ignore — analytics must never break the CLI */
    }
  })();

  pending = pending ? pending.then(() => send) : send;
}

/** Wait briefly for queued events (call once before exit). */
export async function flushTelemetry(ms = 800): Promise<void> {
  if (!pending) return;
  await Promise.race([
    pending,
    new Promise<void>((r) => setTimeout(r, ms)),
  ]);
}

/** Flush on process.exit (commands often exit before run()'s finally). */
export function installTelemetryExitFlush(): void {
  const original = process.exit.bind(process);
  let flushing = false;
  process.exit = ((code?: number) => {
    if (flushing || !pending) {
      original(code);
      return undefined as never;
    }
    flushing = true;
    void flushTelemetry(500).finally(() => original(code ?? 0));
    return undefined as never;
  }) as typeof process.exit;
}
