import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  blockPrimaryUiRel,
  blockUiDestRel,
  shortBlockFileBase,
} from "./block-paths.js";

describe("shortBlockFileBase", () => {
  it("strips module prefix", () => {
    assert.equal(shortBlockFileBase("blog", "blog-list"), "list");
    assert.equal(shortBlockFileBase("blog", "blog-list-cards"), "list-cards");
  });

  it("keeps nav-header under navigation", () => {
    assert.equal(shortBlockFileBase("navigation", "nav-header"), "nav-header");
  });
});

describe("blockUiDestRel", () => {
  it("maps primary blog-list to list.tsx", () => {
    assert.equal(
      blockUiDestRel("blog", "blog-list", "next", "blog-list.tsx"),
      "list.tsx",
    );
  });

  it("keeps nav-header siblings as separate files", () => {
    assert.equal(
      blockUiDestRel("navigation", "nav-header", "next", "nav-header.tsx"),
      "nav-header.tsx",
    );
    assert.equal(
      blockUiDestRel(
        "navigation",
        "nav-header",
        "next",
        "nav-header-client.tsx",
      ),
      "nav-header-client.tsx",
    );
  });

  it("maps contact-form-ui source contact-form.tsx to ui.tsx", () => {
    assert.equal(
      blockUiDestRel("contact-form", "contact-form-ui", "next", "contact-form.tsx"),
      "ui.tsx",
    );
  });
});

describe("blockPrimaryUiRel", () => {
  it("prefers nav-header.tsx over nav-header-client.tsx", () => {
    assert.equal(
      blockPrimaryUiRel("nav-header", [
        { rel: "nav-header-client.tsx" },
        { rel: "nav-header.tsx" },
      ]),
      "nav-header.tsx",
    );
  });

  it("falls back to uniquely named primary (contact-form.tsx)", () => {
    assert.equal(
      blockPrimaryUiRel("contact-form-ui", [{ rel: "contact-form.tsx" }]),
      "contact-form.tsx",
    );
  });
});
