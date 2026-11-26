import { Command } from "commander";
import * as p from "@clack/prompts";
import pc from "picocolors";
import {
  applyModule,
  createTokenClient,
  type ModulePayload,
} from "@dkit/schema";
import { DkitProjectConfigSchema, type Framework } from "@dkit/shared";
import { findProjectRoot } from "../lib/paths.js";
import { getDirectusCreds } from "../lib/env.js";
import {
  loadItem,
  loadRegistryIndex,
  resolveInstallPlan,
} from "../lib/registry.js";
import { parseTemplateFlag } from "../lib/templates.js";
import {
  readProjectConfig,
  writeBlockUi,
  writeModuleTypes,
} from "../lib/write-files.js";

export function addCommand(): Command {
  return new Command("add")
    .description("Add a module and/or UI blocks from the registry")
    .argument("<id>", "module or block id (e.g. blog, blog-list-cards)")
    .option("--schema-only", "Apply Directus layers only (no UI)")
    .option("--ui-only", "Copy UI only (skip schema if possible)")
    .option(
      "--with <blocks>",
      "Comma-separated block ids (overrides default templates)",
    )
    .option(
      "--template <slots>",
      "Override slots: list=blog-list-cards,detail=blog-detail-minimal",
    )
    .option("--seed", "Import seed data when present")
    .option("--dry-run", "Print plan without applying")
    .option("--force", "Overwrite existing UI files")
    .option("--yes", "Confirm reduced-safety schema apply on Directus < 12.2")
    .option("--framework <name>", "UI framework adapter (next|nuxt)", "next")
    .action(
      async (
        id: string,
        opts: {
          schemaOnly?: boolean;
          uiOnly?: boolean;
          with?: string;
          template?: string;
          seed?: boolean;
          dryRun?: boolean;
          force?: boolean;
          yes?: boolean;
          framework?: string;
        },
      ) => {
        p.intro(pc.bgCyan(pc.black(" dkit add ")));
        const framework = (opts.framework ?? "next") as Framework;
        if (framework !== "next" && framework !== "nuxt") {
          p.cancel(
            `Framework "${framework}" is not published yet. Use next or nuxt.`,
          );
          process.exit(1);
        }

        const projectRoot = findProjectRoot();
        const config = DkitProjectConfigSchema.parse({
          ...(readProjectConfig(projectRoot) ?? {}),
          framework,
        });

        const { index, root } = await loadRegistryIndex(config.registry);
        const withBlocks = opts.with
          ? opts.with.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined;
        const templateOverrides = parseTemplateFlag(opts.template);

        const plan = resolveInstallPlan(id, index, root, {
          schemaOnly: opts.schemaOnly,
          uiOnly: opts.uiOnly,
          withBlocks,
          templateOverrides,
        });

        p.log.info(
          `Plan: modules [${plan.modules.join(", ") || "—"}] · blocks [${plan.blocks.join(", ") || "—"}] · framework ${framework}`,
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
          const loaded = await loadItem(moduleId, config.registry, framework);
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

          if (!opts.dryRun) {
            const types = writeModuleTypes(projectRoot, config, mod);
            for (const t of types) p.log.step(`wrote ${t}`);
          }
        }

        if (!opts.schemaOnly) {
          for (const blockId of plan.blocks) {
            const loaded = await loadItem(blockId, config.registry, framework);
            if (loaded.kind !== "block") continue;
            if (opts.dryRun) {
              p.log.info(
                `ui: would write ${loaded.item.uiFiles.length} file(s) for ${blockId} (${framework})`,
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
