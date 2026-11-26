import { Command } from "commander";
import pc from "picocolors";
import path from "node:path";
import fs from "node:fs";
import { createTokenClient, detectDirectusVersion } from "@dkit/schema";
import { findProjectRoot } from "../lib/paths.js";
import { getDirectusCreds } from "../lib/env.js";
import {
  hasShadcnConfig,
  listInstalledShadcnComponents,
} from "../lib/shadcn.js";
import {
  ensurePackageDependency,
  readProjectConfig,
} from "../lib/write-files.js";

export function doctorCommand(): Command {
  return new Command("doctor")
    .description("Check project + Directus connectivity")
    .action(async () => {
      const projectRoot = findProjectRoot();
      const checks: Array<{ ok: boolean; label: string }> = [];

      checks.push({
        ok: fs.existsSync(path.join(projectRoot, "package.json")),
        label: "package.json",
      });
      const config = readProjectConfig(projectRoot);
      checks.push({
        ok: Boolean(config),
        label: "dkit.json",
      });
      checks.push({
        ok: ensurePackageDependency(projectRoot, "@directus/sdk"),
        label: "@directus/sdk installed",
      });

      if (config?.uiAdapter === "shadcn") {
        const shadcnOk = hasShadcnConfig(projectRoot);
        const count = listInstalledShadcnComponents(projectRoot).size;
        checks.push({
          ok: true,
          label: shadcnOk
            ? `shadcn configured (${count} ui component file(s))`
            : "shadcn not initialized yet (dkit add will auto-install)",
        });
      }

      const { url, token } = getDirectusCreds(projectRoot);
      checks.push({ ok: Boolean(url), label: "DIRECTUS_URL" });
      checks.push({ ok: Boolean(token), label: "DIRECTUS_TOKEN" });

      if (url && token) {
        try {
          const client = createTokenClient(url, token);
          const info = await detectDirectusVersion(client, url);
          checks.push({
            ok: info.supported,
            label: `Directus ${info.version} (supported ≥11)`,
          });
          checks.push({
            ok: info.supportsMergeMode,
            label: info.supportsMergeMode
              ? "schema merge mode (12.2+)"
              : "schema merge mode missing — use --yes for fallback",
          });
        } catch (e) {
          checks.push({
            ok: false,
            label: `Directus reachability: ${e instanceof Error ? e.message : e}`,
          });
        }
      } else if (!url) {
        checks.push({
          ok: false,
          label:
            "Tip: pnpm directus:up (in the dkit repo) starts a local Directus on :8010 (v11 → :8011)",
        });
      }

      console.log(pc.bold("\ndkit doctor\n"));
      for (const c of checks) {
        console.log(
          `${c.ok ? pc.green("✓") : pc.red("✗")} ${c.label}`,
        );
      }
      console.log();
      if (checks.some((c) => !c.ok)) process.exit(1);
    });
}
