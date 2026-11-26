import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { addCommand } from "./commands/add.js";
import { listCommand } from "./commands/list.js";
import { doctorCommand } from "./commands/doctor.js";
import {
  flushTelemetry,
  installTelemetryExitFlush,
  setTelemetryDisabled,
  trackCliEvent,
} from "./lib/telemetry.js";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { version } = require("../package.json") as { version: string };

export async function run(argv: string[]): Promise<void> {
  installTelemetryExitFlush();

  const program = new Command();
  program
    .name("dkit")
    .description(
      "Install Directus modules — schema, permissions, flows, and frontend code you own",
    )
    .version(version)
    .option(
      "--no-telemetry",
      "Disable anonymous usage analytics (Umami)",
    );

  program.addCommand(initCommand());
  program.addCommand(addCommand());
  program.addCommand(listCommand());
  program.addCommand(doctorCommand());

  program.hook("preAction", (thisCommand) => {
    const rootOpts = program.opts<{ telemetry?: boolean }>();
    if (rootOpts.telemetry === false) {
      setTelemetryDisabled(true);
      return;
    }

    const name = thisCommand.name();
    if (name === "dkit") return;

    const opts = thisCommand.opts() as Record<string, unknown>;
    const args = thisCommand.args as string[];

    trackCliEvent("cli-command", {
      command: name,
      version,
      id: typeof args[0] === "string" ? args[0] : undefined,
      framework:
        typeof opts.framework === "string" ? opts.framework : undefined,
      schemaOnly: opts.schemaOnly === true ? true : undefined,
      uiOnly: opts.uiOnly === true ? true : undefined,
      seed: opts.seed === true ? true : undefined,
      dryRun: opts.dryRun === true ? true : undefined,
      yes: opts.yes === true ? true : undefined,
    });
  });

  try {
    await program.parseAsync(argv);
  } finally {
    await flushTelemetry();
  }
}
