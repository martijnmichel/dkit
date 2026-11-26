import { spawnSync } from "node:child_process";
import type { Framework } from "@dkit/shared";
import {
  detectPackageManager,
  type PackageManager,
} from "./framework.js";

export type ScaffoldResult = {
  ok: boolean;
  command: string;
  error?: string;
};

function pmFlag(pm: PackageManager): string {
  switch (pm) {
    case "pnpm":
      return "--use-pnpm";
    case "yarn":
      return "--use-yarn";
    case "bun":
      return "--use-bun";
    default:
      return "--use-npm";
  }
}

/**
 * Scaffold a new Next.js or Nuxt app into `cwd` using official CLIs + defaults.
 * Runs create-next-app / nuxi non-interactively.
 */
export function scaffoldFrameworkApp(
  cwd: string,
  framework: Framework,
  packageManager?: PackageManager,
): ScaffoldResult {
  const pm = packageManager ?? detectPackageManager(cwd);

  if (framework === "next") {
    const args = [
      "create-next-app@latest",
      ".",
      "--yes",
      "--ts",
      "--eslint",
      "--tailwind",
      "--app",
      "--no-src-dir",
      "--import-alias",
      "@/*",
      "--turbopack",
      pmFlag(pm),
    ];
    const command = `npx ${args.join(" ")}`;
    const res = spawnSync("npx", args, {
      cwd,
      stdio: "inherit",
      shell: false,
      env: process.env,
    });
    if (res.status !== 0) {
      return {
        ok: false,
        command,
        error: `create-next-app exited with code ${res.status ?? "unknown"}`,
      };
    }
    return { ok: true, command };
  }

  if (framework === "nuxt") {
    const args = [
      "nuxi@latest",
      "init",
      ".",
      "--force",
      "--packageManager",
      pm,
      "--no-gitInit",
      "--no-modules",
    ];
    const command = `npx ${args.join(" ")}`;
    const res = spawnSync("npx", args, {
      cwd,
      stdio: "inherit",
      shell: false,
      env: process.env,
    });
    if (res.status !== 0) {
      return {
        ok: false,
        command,
        error: `nuxi init exited with code ${res.status ?? "unknown"}`,
      };
    }
    return { ok: true, command };
  }

  return {
    ok: false,
    command: "",
    error: `Scaffolding for "${framework}" is not supported yet`,
  };
}
