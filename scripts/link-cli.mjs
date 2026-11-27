#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cliDir = path.join(root, "packages/cli");
const bin = path.join(cliDir, "dist/bin.js");

function run(cmd, args, cwd = root, opts = {}) {
  const res = spawnSync(cmd, args, {
    cwd,
    stdio: opts.silent ? "pipe" : "inherit",
    shell: false,
    env: process.env,
  });
  return res.status ?? 1;
}

console.log("→ Building dkit…");
if (run("pnpm", ["--filter", "@dkit/shared", "build"]) !== 0) process.exit(1);
if (run("pnpm", ["--filter", "@dkit/schema", "build"]) !== 0) process.exit(1);
if (run("pnpm", ["--filter", "@kurbo/dkit", "build"]) !== 0) process.exit(1);
fs.chmodSync(bin, 0o755);

// Prefer a user-local symlink that doesn't need pnpm global setup
const localBinDir = path.join(os.homedir(), ".local", "bin");
const localBin = path.join(localBinDir, "dkit");
fs.mkdirSync(localBinDir, { recursive: true });
try {
  if (fs.existsSync(localBin) || fs.lstatSync(localBin).isSymbolicLink()) {
    fs.unlinkSync(localBin);
  }
} catch {
  // missing is fine
}
fs.symlinkSync(bin, localBin);
console.log(`→ Symlinked ${localBin} → ${bin}`);

const pathEnv = process.env.PATH ?? "";
const onPath = pathEnv.split(path.delimiter).includes(localBinDir);
if (!onPath) {
  console.log(`
⚠  ${localBinDir} is not on your PATH yet.

Add this to ~/.zshrc:

  export PATH="$HOME/.local/bin:$PATH"

Then:  source ~/.zshrc
`);
} else {
  console.log("✓ ~/.local/bin is on PATH");
}

// Also try pnpm/npm global link when available (nice for upgrades)
const pnpmLink = run("pnpm", ["link", "--global"], cliDir, { silent: true });
if (pnpmLink !== 0) {
  const npmLink = run("npm", ["link"], cliDir, { silent: true });
  if (npmLink === 0) {
    console.log("→ Also linked via npm link");
  } else {
    console.log(
      "→ Skipped pnpm/npm global link (optional). Local symlink is enough.",
    );
  }
} else {
  console.log("→ Also linked via pnpm link --global");
}

console.log(`
✓ Done. Run:

  dkit --help
  dkit init
`);
