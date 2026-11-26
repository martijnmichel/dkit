import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getModule, listBlocks, listModules, suggestAdd } from "./tools.js";

function parse(result: { content: Array<{ type: string; text: string }> }) {
  const block = result.content[0];
  assert.ok(block?.type === "text");
  return JSON.parse(block.text) as Record<string, unknown>;
}

describe("dkit mcp tools", () => {
  it("list_modules returns blog", () => {
    const data = parse(listModules());
    const modules = data.modules as Array<{ id: string }>;
    assert.ok(modules.some((m) => m.id === "blog"));
  });

  it("get_module returns templates and install", () => {
    const data = parse(getModule("blog"));
    assert.equal(data.id, "blog");
    assert.ok(data.templates);
    assert.ok(
      (data.install as { command: string }).command.includes("dkit add blog"),
    );
  });

  it("list_blocks can filter by module", () => {
    const data = parse(listBlocks("blog"));
    const blocks = data.blocks as Array<{ id: string }>;
    assert.ok(blocks.every((b) => b.id.startsWith("blog")));
    assert.ok(blocks.some((b) => b.id === "blog-list-cards"));
  });

  it("suggest_add builds dry-run with template", () => {
    const data = parse(
      suggestAdd({
        id: "blog",
        dryRun: true,
        templates: { list: "blog-list-cards" },
      }),
    );
    assert.equal(
      data.command,
      "npx dkit add blog --dry-run --template list=blog-list-cards",
    );
  });

  it("suggest_add rejects bad template option", () => {
    const result = suggestAdd({
      id: "blog",
      templates: { list: "page-detail" },
    });
    assert.equal(result.isError, true);
  });
});
