import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { Framework } from "@dkit/shared";

function uiDirCandidates(projectRoot: string): string[] {
  return [
    path.join(projectRoot, "components", "ui"),
    path.join(projectRoot, "src", "components", "ui"),
  ];
}

export function hasShadcnConfig(projectRoot: string): boolean {
  return fs.existsSync(path.join(projectRoot, "components.json"));
}

export function resolveShadcnUiDir(projectRoot: string): string | null {
  for (const dir of uiDirCandidates(projectRoot)) {
    if (fs.existsSync(dir)) return dir;
  }
  if (hasShadcnConfig(projectRoot)) {
    try {
      const cfg = JSON.parse(
        fs.readFileSync(path.join(projectRoot, "components.json"), "utf8"),
      ) as { aliases?: { ui?: string } };
      const uiAlias = cfg.aliases?.ui ?? "@/components/ui";
      const rel = uiAlias.replace(/^@\//, "");
      const abs = path.join(projectRoot, rel);
      if (fs.existsSync(abs)) return abs;
      const srcAbs = path.join(projectRoot, "src", rel.replace(/^src\//, ""));
      if (fs.existsSync(srcAbs)) return srcAbs;
      return abs;
    } catch {
      /* fall through */
    }
  }
  return null;
}

export function listInstalledShadcnComponents(projectRoot: string): Set<string> {
  const dir = resolveShadcnUiDir(projectRoot);
  const found = new Set<string>();
  if (!dir || !fs.existsSync(dir)) return found;
  for (const name of fs.readdirSync(dir)) {
    const base = name.replace(/\.(tsx|ts|jsx|js|vue)$/, "");
    if (base && base !== "index") found.add(base);
  }
  return found;
}

function shadcnPackage(framework: Framework): string {
  return framework === "nuxt" ? "shadcn-vue@latest" : "shadcn@latest";
}

function runShadcn(
  projectRoot: string,
  framework: Framework,
  args: string[],
): { ok: boolean; command: string; status: number | null } {
  const pkg = shadcnPackage(framework);
  const fullArgs = [pkg, ...args];
  const command = `npx ${fullArgs.join(" ")}`;
  const res = spawnSync("npx", fullArgs, {
    cwd: projectRoot,
    stdio: "inherit",
    shell: false,
    env: process.env,
  });
  return { ok: res.status === 0, command, status: res.status };
}

/**
 * Ensure shadcn is initialized and required components exist.
 * Auto-runs `shadcn init --defaults` then `shadcn add … -y` when missing.
 */
export function ensureShadcnComponents(
  projectRoot: string,
  framework: Framework,
  needed: string[],
  log: (message: string) => void,
): { ok: boolean; error?: string } {
  const unique = [...new Set(needed.map((c) => c.trim()).filter(Boolean))];
  if (!unique.length) return { ok: true };

  if (framework !== "next" && framework !== "nuxt") {
    return {
      ok: false,
      error: `shadcn auto-install is only supported for next/nuxt (got ${framework})`,
    };
  }

  if (!hasShadcnConfig(projectRoot)) {
    log(
      framework === "nuxt"
        ? "shadcn-vue not found — running init --defaults…"
        : "shadcn/ui not found — running init --defaults…",
    );
    const init = runShadcn(projectRoot, framework, [
      "init",
      "--defaults",
      "--force",
    ]);
    if (!init.ok) {
      return {
        ok: false,
        error: `${init.command} failed (exit ${init.status}). Install shadcn manually, then re-run.`,
      };
    }
  }

  const installed = listInstalledShadcnComponents(projectRoot);
  const missing = unique.filter((c) => !installed.has(c));
  if (!missing.length) {
    log(`shadcn components ok (${unique.join(", ")})`);
    return { ok: true };
  }

  log(`Adding shadcn components: ${missing.join(", ")}`);
  const add = runShadcn(projectRoot, framework, [
    "add",
    ...missing,
    "--yes",
    "--overwrite",
  ]);
  if (!add.ok) {
    return {
      ok: false,
      error: `${add.command} failed (exit ${add.status}). Add components manually, then re-run.`,
    };
  }

  const after = listInstalledShadcnComponents(projectRoot);
  const stillMissing = missing.filter((c) => !after.has(c));
  if (stillMissing.length) {
    return {
      ok: false,
      error: `shadcn add finished but still missing: ${stillMissing.join(", ")}`,
    };
  }

  return { ok: true };
}
