import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const targets = [
  path.join(root, "components/dkit"),
  path.join(root, "lib/dkit"),
  path.join(root, "dkit.json"),
];

for (const target of targets) {
  if (!fs.existsSync(target)) continue;
  fs.rmSync(target, { recursive: true, force: true });
  console.log(`removed ${path.relative(root, target)}`);
}

// Keep DIRECTUS_* in .env.local; only strip nothing else
console.log("Cleared dkit-generated files. .env.local kept (if present).");
console.log("Re-install: pnpm dkit:add-blog   (or example:next:reset from root)");
