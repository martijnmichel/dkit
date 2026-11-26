import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/bin.ts"],
  format: ["esm"],
  dts: false,
  clean: true,
  sourcemap: true,
  target: "node20",
  banner: {
    js: "#!/usr/bin/env node",
  },
  external: ["@directus/sdk", "@clack/prompts", "commander", "picocolors", "zod"],
  noExternal: ["@dkit/shared", "@dkit/schema"],
});
