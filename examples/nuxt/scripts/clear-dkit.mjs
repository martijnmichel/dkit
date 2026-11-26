import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const targets = [
  path.join(root, "components/dkit"),
  path.join(root, "lib/dkit"),
  path.join(root, "dkit.json"),
  // Generated slug routes (not the hand-written pages/blog/**)
  path.join(root, "pages/[slug].vue"),
  path.join(root, "pages/pages"),
  path.join(root, "pages/composed"),
  path.join(root, "pages/contact"),
  path.join(root, "pages/contact-form"),
];

for (const target of targets) {
  if (!fs.existsSync(target)) continue;
  fs.rmSync(target, { recursive: true, force: true });
  console.log(`removed ${path.relative(root, target)}`);
}
console.log("Cleared dkit-generated files. .env kept (if present).");
