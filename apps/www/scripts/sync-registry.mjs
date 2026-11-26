import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, "../../../packages/registry");
const dest = path.resolve(here, "../public/r");

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (
      entry.name === "node_modules" ||
      entry.name === "package.json" ||
      entry.name === "ui" ||
      entry.name === "types"
    ) {
      continue;
    }
    const s = path.join(from, entry.name);
    const d = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else if (entry.name.endsWith(".json")) fs.copyFileSync(s, d);
  }
}

fs.rmSync(dest, { recursive: true, force: true });
copyDir(src, dest);
console.log(`Synced registry → ${dest}`);
