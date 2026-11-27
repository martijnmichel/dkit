#!/usr/bin/env node
/**
 * Local monorepo shim — prefer `pnpm dkit:link` so `dkit` is on your PATH.
 * This file is also usable as: node bin/dkit.mjs …
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bin = path.join(root, "packages/cli/dist/bin.js");

if (!fs.existsSync(bin)) {
  console.error("dkit is not built yet. Run: pnpm --filter @kurbo/dkit build");
  process.exit(1);
}

const child = spawn(process.execPath, [bin, ...process.argv.slice(2)], {
  stdio: "inherit",
  env: process.env,
});
child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
