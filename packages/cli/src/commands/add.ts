import { Command } from "commander";
import * as p from "@clack/prompts";
import pc from "picocolors";
import {
  applyModule,
  applyCollectionPrefixToAccess,
  applyCollectionPrefixToFlows,
  applyCollectionPrefixToRestSchema,
  applyCollectionPrefixToSeed,
  buildCollectionMap,
  createTokenClient,
  isRestSchema,
  type ModulePayload,
} from "@dkit/schema";
import {
  DkitProjectConfigSchema,
  normalizeCollectionPrefix,
  type Framework,
} from "@dkit/shared";
import { findProjectRoot } from "../lib/paths.js";
import { getDirectusCreds } from "../lib/env.js";
import { detectFramework } from "../lib/framework.js";
import {
  loadItem,
  loadRegistryIndex,
  resolveInstallPlan,
  type LoadedBlock,
} from "../lib/registry.js";
import { parseTemplateFlag } from "../lib/templates.js";
import {
  normalizeBasePath,
  routeConflictPaths,
  suggestAlternateBasePath,
} from "../lib/routes.js";
import { writeDkitRuntimeConfig } from "../lib/write-config.js";
import {
  listBlockUiConflicts,
  readProjectConfig,
  writeBlockUi,
  writeModuleLib,
  writeProjectConfig,
} from "../lib/write-files.js";
import { joinModulePath, writeModuleSlugRoute } from "../lib/write-routes.js";
import { writeModuleUiEntry } from "../lib/write-ui-entry.js";

function cancelIf<T>(value: T | symbol): asserts value is T {
  if (p.isCancel(value)) {
    p.cancel("Cancelled");
    process.exit(0);
  }
}

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
    .option("--path <basePath>", "Prefill route base path (still prompted unless --yes)")
    .option(
      "--prefix <prefix>",
      "Prefill collection prefix (default dkit_; empty string = none)",
    )
    .option(
      "--seed",
      "Import seed data when present (create-or-update by id; safe to re-run)",
    )
    .option("--dry-run", "Print plan without applying")
    .option("--force", "Overwrite existing UI files")
    .option(
      "--yes",
      "Non-interactive: use defaults / flags; also confirms Directus < 12.2 apply",
    )
    .option("--framework <name>", "UI framework adapter (next|nuxt); default: dkit.json or auto-detect")
    .action(
      async (
        id: string,
        opts: {
          schemaOnly?: boolean;
          uiOnly?: boolean;
          with?: string;
          template?: string;
          path?: string;
          prefix?: string;
          seed?: boolean;
          dryRun?: boolean;
          force?: boolean;
          yes?: boolean;
          framework?: string;
        },
      ) => {
        p.intro(pc.bgCyan(pc.black(" dkit add ")));
        const projectRoot = findProjectRoot();
        const existingConfig = readProjectConfig(projectRoot);
        const detected = detectFramework(projectRoot).framework;
        const framework = (opts.framework ??
          existingConfig?.framework ??
          detected ??
          "next") as Framework;
        if (framework !== "next" && framework !== "nuxt") {
          p.cancel(
            `Framework "${framework}" is not published yet. Use next or nuxt.`,
          );
          process.exit(1);
        }
        if (!opts.framework && !existingConfig?.framework && detected) {
          p.log.step(`Detected framework: ${framework}`);
        }

        let config = DkitProjectConfigSchema.parse({
          ...(existingConfig ?? {}),
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

        // —— Collection prefix (always ask unless --yes) ——
        const prefixDefault =
          opts.prefix ?? config.collectionPrefix ?? "dkit_";
        let collectionPrefix = normalizeCollectionPrefix(prefixDefault);
        if (!opts.yes) {
          const prefixAnswer = await p.text({
            message: "Collection name prefix",
            placeholder: "dkit_",
            initialValue: collectionPrefix,
            validate: (v) => {
              if (v === undefined) return "Required (use empty for none)";
              return undefined;
            },
          });
          cancelIf(prefixAnswer);
          collectionPrefix = normalizeCollectionPrefix(prefixAnswer);
        }
        config = {
          ...config,
          collectionPrefix,
        };
        p.log.step(
          collectionPrefix
            ? `Collections will be prefixed with "${collectionPrefix}" (e.g. posts → ${collectionPrefix}posts)`
            : "No collection prefix — using logical names as-is",
        );

        // —— Route base path: ALWAYS ask when a module declares defaultBasePath and UI installs ——
        const moduleBasePaths: Record<string, string> = {
          ...(config.modules
            ? Object.fromEntries(
                Object.entries(config.modules).map(([k, v]) => [
                  k,
                  v.basePath ?? "",
                ]),
              )
            : {}),
        };

        if (!opts.schemaOnly) {
          for (const moduleId of plan.modules.length
            ? plan.modules
            : await modulesNeedingPathFromBlocks(plan.blocks, index, root)) {
            const loaded = await loadItem(moduleId, config.registry, framework);
            if (loaded.kind !== "module") continue;
            const defaultPath =
              loaded.item.manifest.defaultBasePath ??
              config.modules?.[moduleId]?.basePath;
            if (!defaultPath) continue;

            const preferred = normalizeBasePath(
              opts.path ??
                config.modules?.[moduleId]?.basePath ??
                defaultPath,
            );
            const conflicts = routeConflictPaths(
              projectRoot,
              framework,
              preferred,
            );
            const suggested = suggestAlternateBasePath(
              projectRoot,
              framework,
              preferred,
            );

            let basePath = preferred;
            if (opts.yes) {
              if (conflicts.length && !opts.path) {
                basePath = suggested;
                p.log.warn(
                  `Route ${preferred} exists — using ${basePath} (--yes). Pass --path to force.`,
                );
              }
            } else {
              if (conflicts.length) {
                p.log.warn(
                  `Path ${preferred} already exists in this project:\n  ${conflicts.map((c) => c.replace(projectRoot + "/", "")).join("\n  ")}`,
                );
              }
              const answer = await p.text({
                message: `Base path for "${moduleId}" routes`,
                placeholder: preferred,
                initialValue: conflicts.length ? suggested : preferred,
                validate: (v) => {
                  if (!v?.trim()) return "Path is required";
                  if (!v.trim().startsWith("/")) return "Use a path like /blog";
                  return undefined;
                },
              });
              cancelIf(answer);
              basePath = normalizeBasePath(answer);
              const again = routeConflictPaths(
                projectRoot,
                framework,
                basePath,
              );
              if (again.length) {
                const proceed = await p.confirm({
                  message: `${basePath} still collides with existing files. Continue anyway?`,
                  initialValue: false,
                });
                cancelIf(proceed);
                if (!proceed) {
                  p.cancel("Pick another path and re-run.");
                  process.exit(0);
                }
              }
            }

            moduleBasePaths[moduleId] = basePath;
            config = {
              ...config,
              modules: {
                ...config.modules,
                [moduleId]: {
                  ...config.modules?.[moduleId],
                  basePath,
                  blocks: plan.blocks,
                },
              },
            };
            p.log.step(`Route base for ${moduleId}: ${basePath}`);
          }
        }

        // Detect existing UI up front (shadcn-style) so schema isn't applied then aborted
        let overwriteUi = Boolean(opts.force);
        const pendingBlocks: LoadedBlock[] = [];
        if (!opts.schemaOnly) {
          for (const blockId of plan.blocks) {
            const loaded = await loadItem(blockId, config.registry, framework);
            if (loaded.kind !== "block") continue;
            pendingBlocks.push(loaded.item);
          }
          if (!opts.dryRun && pendingBlocks.length) {
            const conflicts = pendingBlocks.flatMap((b) =>
              listBlockUiConflicts(projectRoot, config, b),
            );
            if (conflicts.length && !overwriteUi) {
              p.log.warn(
                `The following UI file(s) already exist:\n  ${conflicts.join("\n  ")}`,
              );
              if (opts.yes) {
                p.log.warn(
                  "Keeping existing UI (--yes). Pass --force to overwrite.",
                );
              } else {
                const answer = await p.confirm({
                  message: `Overwrite ${conflicts.length} existing UI file(s)?`,
                  initialValue: false,
                });
                cancelIf(answer);
                overwriteUi = Boolean(answer);
                if (!overwriteUi) {
                  p.log.info("Keeping existing UI files.");
                }
              }
            }
          }
        }

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

        const allLogicalCollections = new Set<string>();

        for (const moduleId of plan.modules) {
          const loaded = await loadItem(moduleId, config.registry, framework);
          if (loaded.kind !== "module") continue;
          const mod = loaded.item;
          for (const c of mod.manifest.collections) allLogicalCollections.add(c);

          if (!opts.uiOnly && client && url) {
            let snapshot = mod.snapshot as ModulePayload["snapshot"];
            let access = mod.access as ModulePayload["access"];
            let flows = mod.flows as ModulePayload["flows"];
            let seed = mod.seed as ModulePayload["seed"];

            if (snapshot && isRestSchema(snapshot)) {
              snapshot = applyCollectionPrefixToRestSchema(
                snapshot,
                collectionPrefix,
              );
            }
            if (access) {
              access = applyCollectionPrefixToAccess(access, collectionPrefix);
            }
            if (flows) {
              flows = applyCollectionPrefixToFlows(flows, collectionPrefix);
            }
            if (seed) {
              seed = applyCollectionPrefixToSeed(seed, collectionPrefix);
            }

            const payload: ModulePayload = {
              snapshot,
              access,
              flows,
              seed,
              collections: mod.manifest.collections.map(
                (c) => buildCollectionMap([c], collectionPrefix)[c]!,
              ),
            };
            try {
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
            } catch (e) {
              const msg =
                e instanceof Error
                  ? e.message
                  : typeof e === "object" && e && "errors" in e
                    ? JSON.stringify(e)
                    : String(e);
              p.cancel(`Directus apply failed: ${msg}`);
              process.exit(1);
            }
          }

          if (!opts.dryRun) {
            const libs = writeModuleLib(projectRoot, config, mod);
            for (const t of libs) p.log.step(`wrote ${t}`);
          }
        }

        // Collect collections from dependency modules when only blocks added
        for (const blockId of plan.blocks) {
          const be = index.items.find((i) => i.id === blockId);
          for (const dep of be?.registryDependencies ?? []) {
            const depEntry = index.items.find((i) => i.id === dep);
            if (depEntry?.type === "dkit:module") {
              const loaded = await loadItem(dep, config.registry, framework);
              if (loaded.kind === "module") {
                for (const c of loaded.item.manifest.collections) {
                  allLogicalCollections.add(c);
                }
              }
            }
          }
        }

        const installedBlocks: LoadedBlock[] = [...pendingBlocks];

        if (!opts.schemaOnly) {
          for (const block of pendingBlocks) {
            if (opts.dryRun) {
              p.log.info(
                `ui: would write ${block.uiFiles.length} file(s) for ${block.manifest.id} (${framework})`,
              );
              continue;
            }
            const { written, skipped } = writeBlockUi(
              projectRoot,
              config,
              block,
              overwriteUi,
            );
            for (const f of written) p.log.step(`wrote ${f}`);
            for (const f of skipped) p.log.info(`skipped ${f}`);
          }
        }

        // Static entry re-exports so app routes don't dynamic-import optional templates
        if (!opts.dryRun && !opts.schemaOnly && installedBlocks.length) {
          const moduleIds = new Set<string>([
            ...plan.modules,
            ...(await modulesNeedingPathFromBlocks(plan.blocks, index, root)),
          ]);
          if (moduleIds.size === 0) {
            for (const b of installedBlocks) {
              const dep = b.manifest.registryDependencies?.[0];
              if (dep) moduleIds.add(dep);
            }
          }
          for (const moduleId of moduleIds) {
            const forModule = installedBlocks.filter((b) =>
              (b.manifest.registryDependencies ?? []).includes(moduleId),
            );
            if (!forModule.length) continue;
            const entry = writeModuleUiEntry(
              projectRoot,
              config,
              moduleId,
              forModule,
            );
            p.log.step(`wrote ${entry}`);

            const hasDetail = forModule.some(
              (b) => (b.manifest.slot ?? "") === "detail",
            );
            const basePath =
              moduleBasePaths[moduleId] ??
              config.modules?.[moduleId]?.basePath;
            if (hasDetail && basePath) {
              const route = writeModuleSlugRoute(
                projectRoot,
                config,
                moduleId,
                basePath,
                overwriteUi,
              );
              if (route.written) p.log.step(`wrote ${route.written}`);
              if (route.skipped) p.log.info(`skipped ${route.skipped}`);
              if (route.note) p.log.info(route.note);
            }
          }
        }

        if (!opts.dryRun) {
          const collectionMap = {
            ...(config.collections ?? {}),
            ...buildCollectionMap(
              [...allLogicalCollections],
              collectionPrefix,
            ),
          };
          config = { ...config, collections: collectionMap };
          const configFile = writeDkitRuntimeConfig(
            projectRoot,
            config,
            collectionMap,
          );
          writeProjectConfig(projectRoot, config);
          p.log.step(`wrote ${configFile}`);
          p.log.step(`updated dkit.json (prefix + module paths)`);
        }

        p.note(
          [
            collectionPrefix
              ? `Prefix: ${collectionPrefix}`
              : "Prefix: (none)",
            ...Object.entries(moduleBasePaths)
              .filter(([, v]) => v)
              .map(([k, v]) => {
                const url =
                  v === "/"
                    ? "/{slug}"
                    : `${joinModulePath(v, "{slug}")}`;
                return `Path ${k}: ${v}  →  ${url}`;
              }),
            "",
            "Detail routes are scaffolded when missing (re-run with UI overwrite to replace).",
          ].join("\n"),
          "Install summary",
        );

        p.outro(opts.dryRun ? pc.yellow("Dry run complete") : pc.green("Done"));
      },
    );
}

async function modulesNeedingPathFromBlocks(
  blocks: string[],
  index: { items: Array<{ id: string; type: string; registryDependencies?: string[] }> },
  _root: string,
): Promise<string[]> {
  const mods = new Set<string>();
  for (const b of blocks) {
    const be = index.items.find((i) => i.id === b);
    for (const dep of be?.registryDependencies ?? []) {
      const d = index.items.find((i) => i.id === dep);
      if (d?.type === "dkit:module") mods.add(dep);
    }
  }
  return [...mods];
}
