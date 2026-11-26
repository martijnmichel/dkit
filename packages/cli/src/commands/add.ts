import { Command } from "commander";
import * as p from "@clack/prompts";
import pc from "picocolors";
import {
  applyModule,
  createTokenClient,
  type ModulePayload,
} from "@dkit/schema";
import { DkitProjectConfigSchema } from "@dkit/shared";
import { findProjectRoot } from "../lib/paths.js";
import { getDirectusCreds } from "../lib/env.js";
import {
  loadItem,
  loadRegistryIndex,
  resolveInstallPlan,
} from "../lib/registry.js";
import {
  readProjectConfig,
  writeBlockUi,
  writeModuleTypes,
} from "../lib/write-files.js";

export function addCommand(): Command {
  return new Command("add")
    .description("Add a module and/or UI blocks from the registry")
    .argument("<id>", "module or block id (e.g. blog, blog-list)")
    .option("--schema-only", "Apply Directus layers only (no UI)")
    .option("--ui-only", "Copy UI only (skip schema if possible)")
    .option("--with <blocks>", "Comma-separated block ids to install with a module")
    .option("--seed", "Import seed data when present")
    .option("--dry-run", "Print plan without applying")
    .option("--force", "Overwrite existing UI files")
    .option("--yes", "Confirm reduced-safety schema apply on Directus < 12.2")
    .option("--framework <name>", "UI framework adapter", "next")
    .action(
      async (
        id: string,
        opts: {
          schemaOnly?: boolean;
          uiOnly?: boolean;
          with?: string;
          seed?: boolean;
          dryRun?: boolean;
          force?: boolean;
          yes?: boolean;
          framework?: string;
        },
      ) => {
        p.intro(pc.bgCyan(pc.black(" dkit add ")));
        if (opts.framework && opts.framework !== "next") {
          p.cancel(
            `Framework "${opts.framework}" is not published yet. MVP ships next only.`,
          );
          process.exit(1);
        }

        const projectRoot = findProjectRoot();
        const config = DkitProjectConfigSchema.parse(
          readProjectConfig(projectRoot) ?? {},
        );

        const { index } = await loadRegistryIndex(config.registry);
        const withBlocks = opts.with
          ? opts.with.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined;

        const plan = resolveInstallPlan(id, index, {
          schemaOnly: opts.schemaOnly,
          uiOnly: opts.uiOnly,
          withBlocks,
        });

        p.log.info(
          `Plan: modules [${plan.modules.join(", ") || "—"}] · blocks [${plan.blocks.join(", ") || "—"}]`,
        );

        const { url, token } = getDirectusCreds(projectRoot);
        const needsDirectus = plan.modules.length > 0 && !opts.uiOnly;

        if (needsDirectus) {
          if (!url || !token) {
            p.cancel(
              "Missing DIRECTUS_URL / DIRECTUS_TOKEN. Run `dkit init` first.",
            );
            process.exit(1);
          }
          if (!opts.dryRun) {
            p.log.warn(
              "This will modify your Directus schema/policies. Prefer a staging instance or backup first.",
            );
          }
        }

        const client =
          url && token ? createTokenClient(url, token) : null;

        for (const moduleId of plan.modules) {
          const loaded = await loadItem(moduleId, config.registry);
          if (loaded.kind !== "module") continue;
          const mod = loaded.item;

          if (!opts.uiOnly && client && url) {
            const payload: ModulePayload = {
              snapshot: mod.snapshot as ModulePayload["snapshot"],
              access: mod.access as ModulePayload["access"],
              flows: mod.flows as ModulePayload["flows"],
              seed: mod.seed as ModulePayload["seed"],
              collections: mod.manifest.collections,
            };
            const result = await applyModule(client, url, payload, {
              dryRun: opts.dryRun,
              seed: opts.seed,
              confirmReducedSafety: opts.yes,
              onLog: (m) => p.log.step(m),
            });
            if (opts.dryRun) {
              for (const line of result.dryRunPlan) p.log.info(line);
            }
            for (const w of result.warnings) p.log.warn(w);
          }

          if (!opts.dryRun && !opts.schemaOnly) {
            // types go with module even for schema-only? include always when module installs
          }
          if (!opts.dryRun) {
            const types = writeModuleTypes(projectRoot, config, mod);
            for (const t of types) p.log.step(`wrote ${t}`);
          }
        }

        if (!opts.schemaOnly) {
          for (const blockId of plan.blocks) {
            const loaded = await loadItem(blockId, config.registry);
            if (loaded.kind !== "block") continue;
            if (opts.dryRun) {
              p.log.info(
                `ui: would write ${loaded.item.uiFiles.length} file(s) for ${blockId}`,
              );
              continue;
            }
            const files = writeBlockUi(
              projectRoot,
              config,
              loaded.item,
              Boolean(opts.force),
            );
            for (const f of files) p.log.step(`wrote ${f}`);
          }
        }

        p.outro(opts.dryRun ? pc.yellow("Dry run complete") : pc.green("Done"));
      },
    );
}
