import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const bin = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../dist/bin.js",
);
fs.chmodSync(bin, 0o755);
