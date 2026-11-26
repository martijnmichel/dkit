import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { addCommand } from "./commands/add.js";
import { listCommand } from "./commands/list.js";
import { doctorCommand } from "./commands/doctor.js";

export async function run(argv: string[]): Promise<void> {
  const program = new Command();
  program
    .name("dkit")
    .description(
      "Install Directus modules — schema, permissions, flows, and frontend code you own",
    )
    .version("0.1.0");

  program.addCommand(initCommand());
  program.addCommand(addCommand());
  program.addCommand(listCommand());
  program.addCommand(doctorCommand());

  await program.parseAsync(argv);
}
