import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { detectFramework, isScaffoldableDir } from "./framework.js";

function tmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "dkit-fw-"));
}

describe("detectFramework", () => {
  it("detects next from dependency", () => {
    const dir = tmpDir();
    fs.writeFileSync(
      path.join(dir, "package.json"),
      JSON.stringify({ dependencies: { next: "15.0.0" } }),
    );
    assert.equal(detectFramework(dir).framework, "next");
  });

  it("detects nuxt from config file", () => {
    const dir = tmpDir();
    fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({}));
    fs.writeFileSync(path.join(dir, "nuxt.config.ts"), "export default {}");
    assert.equal(detectFramework(dir).framework, "nuxt");
  });

  it("returns null when unknown", () => {
    const dir = tmpDir();
    fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({ name: "x" }));
    assert.equal(detectFramework(dir).framework, null);
  });
});

describe("isScaffoldableDir", () => {
  it("is true for empty dir", () => {
    assert.equal(isScaffoldableDir(tmpDir()), true);
  });

  it("is true when only .git present", () => {
    const dir = tmpDir();
    fs.mkdirSync(path.join(dir, ".git"));
    assert.equal(isScaffoldableDir(dir), true);
  });

  it("is false when package.json exists", () => {
    const dir = tmpDir();
    fs.writeFileSync(path.join(dir, "package.json"), "{}");
    assert.equal(isScaffoldableDir(dir), false);
  });
});
