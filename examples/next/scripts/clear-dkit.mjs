import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const targets = [
  path.join(root, "components/dkit"),
  path.join(root, "lib/dkit"),
  path.join(root, "dkit.json"),
  // Generated slug routes (not the hand-written app/blog/**)
  path.join(root, "app/[slug]"),
  path.join(root, "app/pages"),
  path.join(root, "app/composed"),
  path.join(root, "app/contact"),
  path.join(root, "app/contact-form"),
];

for (const target of targets) {
  if (!fs.existsSync(target)) continue;
  fs.rmSync(target, { recursive: true, force: true });
  console.log(`removed ${path.relative(root, target)}`);
}

// Restore stub barrel so Next can always resolve @/components/dkit/blog
const stubDir = path.join(root, "components/dkit/blog");
fs.mkdirSync(stubDir, { recursive: true });
fs.writeFileSync(
  path.join(stubDir, "index.tsx"),
  `/** Stub — run \`dkit add blog\` to generate real UI exports. */
export const installed = false;
export const moduleId = "blog" as const;
export const blocks = [] as const;

export function List() {
  return null;
}

export function Detail(_props: { slug: string }) {
  return null;
}
`,
);
console.log("restored components/dkit/blog/index.tsx stub");

console.log("Cleared dkit-generated files. .env.local kept (if present).");
console.log("Re-install: pnpm dkit:add-blog   (or example:next:reset from root)");
