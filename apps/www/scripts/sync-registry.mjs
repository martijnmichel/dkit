import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, "../../../packages/registry");
const dest = path.resolve(here, "../public/r");
const previewDest = path.resolve(here, "../public/preview");
const proseSrc = path.join(src, "shared", "prose.css");
const proseDest = path.resolve(here, "../styles/dkit/prose.css");

function copyDir(from, to, { jsonOnly = false } = {}) {
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
    if (entry.isDirectory()) copyDir(s, d, { jsonOnly });
    else if (!jsonOnly || entry.name.endsWith(".json")) fs.copyFileSync(s, d);
  }
}

function syncPreviewAssets() {
  fs.rmSync(previewDest, { recursive: true, force: true });
  const modulesDir = path.join(src, "modules");
  for (const name of fs.readdirSync(modulesDir)) {
    const assets = path.join(modulesDir, name, "services", "assets");
    if (!fs.existsSync(assets)) continue;
    const out = path.join(previewDest, name);
    fs.mkdirSync(out, { recursive: true });
    for (const file of fs.readdirSync(assets)) {
      fs.copyFileSync(path.join(assets, file), path.join(out, file));
    }
  }
}

fs.rmSync(dest, { recursive: true, force: true });
copyDir(src, dest, { jsonOnly: true });
syncPreviewAssets();

if (fs.existsSync(proseSrc)) {
  fs.mkdirSync(path.dirname(proseDest), { recursive: true });
  fs.copyFileSync(proseSrc, proseDest);
}

console.log(`Synced registry → ${dest}`);
console.log(`Synced preview assets → ${previewDest}`);
