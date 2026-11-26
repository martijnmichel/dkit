import { Command } from "commander";
import pc from "picocolors";
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
      const { index } = await loadRegistryIndex(config.registry);

      console.log(pc.bold(`\n${index.name} registry\n`));
      const modules = index.items.filter((i) => i.type === "dkit:module");
      const blocks = index.items.filter((i) => i.type === "dkit:block");

      console.log(pc.cyan("Modules"));
      for (const m of modules) {
        console.log(
          `  ${pc.green(m.id.padEnd(18))} ${m.description} ${pc.dim(`v${m.version}`)}`,
        );
        if (m.defaultBlocks?.length) {
          console.log(pc.dim(`    default blocks: ${m.defaultBlocks.join(", ")}`));
        }
      }

      console.log(pc.cyan("\nBlocks"));
      for (const b of blocks) {
        console.log(
          `  ${pc.green(b.id.padEnd(18))} ${b.description} ${pc.dim(`v${b.version}`)}`,
        );
      }
      console.log();
    });
}
