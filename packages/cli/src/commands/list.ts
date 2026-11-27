import { Command } from "commander";
import pc from "picocolors";
import fs from "node:fs";
import path from "node:path";
import { DkitProjectConfigSchema } from "@dkit/shared";
import { findProjectRoot } from "../lib/paths.js";
import { loadRegistryIndex } from "../lib/registry.js";
import { readProjectConfig } from "../lib/write-files.js";

export function listCommand(): Command {
  return new Command("list")
    .description("List available modules and blocks")
    .action(async () => {
      const projectRoot = findProjectRoot();
      const config = DkitProjectConfigSchema.parse(
        readProjectConfig(projectRoot) ?? {},
      );
      const { index, root } = await loadRegistryIndex(config.registry);

      console.log(pc.bold(`\n${index.name} registry\n`));
      const modules = index.items.filter((i) => i.type === "dkit:module");
      const blocks = index.items.filter((i) => i.type === "dkit:block");

      console.log(pc.cyan("Modules"));
      for (const m of modules) {
        console.log(
          `  ${pc.green(m.id.padEnd(18))} ${m.description} ${pc.dim(`v${m.version}`)}`,
        );
        const manifestPath = path.join(root, m.path, "module.json");
        if (fs.existsSync(manifestPath)) {
          const manifest = JSON.parse(
            fs.readFileSync(manifestPath, "utf8"),
          ) as {
            templates?: Record<string, { default: string; options?: string[] }>;
            defaultBlocks?: string[];
          };
          if (manifest.templates) {
            for (const [slot, def] of Object.entries(manifest.templates)) {
              const opts = (def.options ?? [def.default]).join(" | ");
              console.log(
                pc.dim(
                  `    ${slot}: default=${def.default} · options: ${opts}`,
                ),
              );
            }
          } else if (m.defaultBlocks?.length) {
            console.log(
              pc.dim(`    default blocks: ${m.defaultBlocks.join(", ")}`),
            );
          }
        }
      }

      console.log(pc.cyan("\nComponents / templates"));
      for (const b of blocks) {
        const slot = b.slot ? pc.dim(` [${b.slot}]`) : "";
        console.log(
          `  ${pc.green(b.id.padEnd(22))} ${b.description}${slot} ${pc.dim(`v${b.version}`)}`,
        );
      }
      console.log(
        pc.dim(
          "\nModule:     dkit add blog          (interactive component select)",
        ),
      );
      console.log(
        pc.dim(
          "Component:  dkit add blog-list-cards  (installs module if needed)",
        ),
      );
      console.log(
        pc.dim(
          "Flags:      --with a,b  ·  --template list=blog-list-cards  ·  --yes uses defaults\n",
        ),
      );
    });
}
