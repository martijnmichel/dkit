import fs from "node:fs";
import path from "node:path";

export function readEnvLocal(projectRoot: string): Record<string, string> {
  const file = path.join(projectRoot, ".env.local");
  if (!fs.existsSync(file)) return {};
  const out: Record<string, string> = {};
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

export function upsertEnvLocal(
  projectRoot: string,
  values: Record<string, string>,
): void {
  const file = path.join(projectRoot, ".env.local");
  const existing = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  const lines = existing ? existing.split("\n") : [];
  const keys = new Set(Object.keys(values));
  const next: string[] = [];

  for (const line of lines) {
    const eq = line.indexOf("=");
    if (eq === -1) {
      next.push(line);
      continue;
    }
    const key = line.slice(0, eq).trim();
    if (keys.has(key)) continue;
    next.push(line);
  }

  if (next.length && next[next.length - 1] !== "") next.push("");
  for (const [key, value] of Object.entries(values)) {
    next.push(`${key}=${value}`);
  }
  fs.writeFileSync(file, `${next.join("\n").replace(/\n+$/, "")}\n`, "utf8");

  // Nuxt / generic Node often read `.env` — mirror URL (not token) there
  if (values.DIRECTUS_URL) {
    const envFile = path.join(projectRoot, ".env");
    const existingEnv = fs.existsSync(envFile)
      ? fs.readFileSync(envFile, "utf8")
      : "";
    const envLines = existingEnv ? existingEnv.split("\n") : [];
    const filtered = envLines.filter(
      (line) => !line.trim().startsWith("DIRECTUS_URL="),
    );
    if (filtered.length && filtered[filtered.length - 1] !== "") filtered.push("");
    filtered.push(`DIRECTUS_URL=${values.DIRECTUS_URL}`);
    fs.writeFileSync(
      envFile,
      `${filtered.join("\n").replace(/\n+$/, "")}\n`,
      "utf8",
    );
  }
}

export function getDirectusCreds(projectRoot: string): {
  url?: string;
  token?: string;
} {
  const env = {
    ...readEnvLocal(projectRoot),
    ...process.env,
  };
  return {
    url: env.DIRECTUS_URL,
    token: env.DIRECTUS_TOKEN,
  };
}
