"use client";

import type { BlockSandpackProject } from "@/lib/sandpack/build-project";
import type { PreviewFramework } from "@/lib/preview-prefs";
import {
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  SandpackCodeEditor,
} from "@codesandbox/sandpack-react";
import { useMemo, useState } from "react";

export function SandpackBlockPreview({
  project,
  framework,
}: {
  project: BlockSandpackProject;
  framework: PreviewFramework;
}) {
  const [showCode, setShowCode] = useState(false);

  const resolved = useMemo(() => {
    const preferred =
      framework === "nuxt" ? project.nuxt : project.next;
    const fallback =
      framework === "nuxt" ? project.next : project.nuxt;
    const files = preferred ?? fallback;
    const actualFramework: PreviewFramework =
      preferred != null
        ? framework
        : framework === "nuxt"
          ? "next"
          : "nuxt";
    return { files, actualFramework, missingPreferred: !preferred };
  }, [project, framework]);

  if (!resolved.files) {
    return (
      <p className="p-6 text-sm text-muted-foreground">
        No Sandpack project for <code className="font-mono">{project.blockId}</code>.
      </p>
    );
  }

  const template =
    resolved.actualFramework === "nuxt" ? "vite-vue-ts" : "vite-react-ts";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <p className="text-xs text-muted-foreground">
          {resolved.missingPreferred ? (
            <>
              No {framework} UI for this block — showing{" "}
              <span className="font-medium text-foreground">
                {resolved.actualFramework}
              </span>
              .
            </>
          ) : (
            <>
              Live via Sandpack (
              <span className="font-medium text-foreground">
                {resolved.actualFramework === "nuxt"
                  ? "Vite + Vue · shadcn-vue tokens"
                  : "Vite + React · shadcn tokens"}
              </span>
              )
            </>
          )}
        </p>
        <button
          type="button"
          onClick={() => setShowCode((v) => !v)}
          className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
        >
          {showCode ? "Hide code" : "Show code"}
        </button>
      </div>

      <SandpackProvider
        key={`${project.blockId}-${resolved.actualFramework}`}
        template={template}
        theme="light"
        files={resolved.files}
        options={{
          recompileMode: "delayed",
          recompileDelay: 400,
          externalResources: [
            "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4",
          ],
        }}
        customSetup={{
          dependencies:
            resolved.actualFramework === "nuxt"
              ? {}
              : { react: "^19.0.0", "react-dom": "^19.0.0" },
        }}
      >
        <SandpackLayout
          style={{
            borderRadius: 12,
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}
        >
          {showCode ? (
            <SandpackCodeEditor
              showTabs
              showLineNumbers
              style={{ height: 360 }}
            />
          ) : null}
          <SandpackPreview
            showOpenInCodeSandbox
            showRefreshButton
            style={{ height: showCode ? 360 : 520 }}
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
