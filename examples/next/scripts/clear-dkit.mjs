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

function writeStub(rel, contents) {
  const dest = path.join(root, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, contents);
  console.log(`restored ${rel} stub`);
}

// Restore stubs so layout / pages always resolve module barrels.
writeStub(
  "components/dkit/blog/index.tsx",
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

writeStub(
  "components/dkit/settings/index.tsx",
  `/** Stub — run \`dkit add settings\` to generate real UI exports. */
import type { ReactNode } from "react";

export const installed = false;
export const moduleId = "settings" as const;
export const blocks = [] as const;

export async function SocialLinks() {
  return null;
}
export async function MaintenanceGate({ children }: { children: ReactNode }) {
  return children;
}
export async function SiteLogo() {
  return null;
}
export async function SiteBrand() {
  return null;
}
`,
);

writeStub(
  "components/dkit/navigation/index.tsx",
  `/** Stub — run \`dkit add navigation\` to generate real UI exports. */
export const installed = false;
export const moduleId = "navigation" as const;
export const blocks = [] as const;

export async function NavHeader() {
  return null;
}
export async function NavFooter() {
  return null;
}
`,
);

writeStub(
  "lib/dkit/settings.ts",
  `/** Stub — run \`dkit add settings\` to generate real helpers. */
export async function getSiteMetadata() {
  return {
    title: "dkit example (Next.js)",
    description: "Playground for testing dkit installs",
  };
}
`,
);

console.log("Cleared dkit-generated files. .env.local kept (if present).");
console.log("Re-install: pnpm dkit:add-blog   (or example:next:reset from root)");
