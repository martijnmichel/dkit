import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { loadRegistryIndex } from "./registry.js";
import {
  listModuleUiOptions,
  mergeBlockIds,
  resolveDefaultBlocksFromTemplates,
} from "./templates.js";

const registryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../registry",
);

describe("listModuleUiOptions", () => {
  it("lists blog components with defaults selected", async () => {
    const { index, root } = await loadRegistryIndex(registryRoot);
    const options = listModuleUiOptions("blog", index, root);
    const ids = options.map((o) => o.id);
    assert.ok(ids.includes("blog-list"));
    assert.ok(ids.includes("blog-list-cards"));
    assert.ok(ids.includes("blog-detail"));
    assert.equal(options.find((o) => o.id === "blog-list")?.isDefault, true);
    assert.equal(
      options.find((o) => o.id === "blog-list-cards")?.isDefault,
      false,
    );
    assert.equal(options.find((o) => o.id === "blog-detail")?.isDefault, true);
  });
});

describe("resolveDefaultBlocksFromTemplates", () => {
  it("honors empty withBlocks (no defaults)", async () => {
    const { index, root } = await loadRegistryIndex(registryRoot);
    const blocks = resolveDefaultBlocksFromTemplates(
      "blog",
      index,
      root,
      {},
      [],
    );
    assert.deepEqual(blocks, []);
  });

  it("uses defaults when withBlocks is omitted", async () => {
    const { index, root } = await loadRegistryIndex(registryRoot);
    const blocks = resolveDefaultBlocksFromTemplates("blog", index, root, {});
    assert.deepEqual(blocks, ["blog-list", "blog-detail"]);
  });
});

describe("mergeBlockIds", () => {
  it("unions without duplicates", () => {
    assert.deepEqual(mergeBlockIds(["a", "b"], ["b", "c"]), ["a", "b", "c"]);
    assert.deepEqual(mergeBlockIds(undefined, ["x"]), ["x"]);
  });
});
