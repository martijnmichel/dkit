"use client";

import { useState } from "react";

export function ModuleTabs({
  preview,
  transparency,
}: {
  preview: React.ReactNode;
  transparency: React.ReactNode;
}) {
  const [tab, setTab] = useState<"preview" | "schema">("preview");

  return (
    <div>
      <div className="tabs">
        <button
          type="button"
          className="tab"
          aria-current={tab === "preview" ? "page" : undefined}
          onClick={() => setTab("preview")}
        >
          Preview
        </button>
        <button
          type="button"
          className="tab"
          aria-current={tab === "schema" ? "page" : undefined}
          onClick={() => setTab("schema")}
        >
          Schema & permissions
        </button>
      </div>
      {tab === "preview" ? preview : transparency}
    </div>
  );
}
