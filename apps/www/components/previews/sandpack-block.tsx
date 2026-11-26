"use client";

import type { BlockSandpackProject } from "@/lib/sandpack/build-project";
import type { PreviewFramework } from "@/lib/preview-prefs";
import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

function useResolvedProject(
  project: BlockSandpackProject,
  framework: PreviewFramework,
) {
  return useMemo(() => {
    const preferred = framework === "nuxt" ? project.nuxt : project.next;
    const fallback = framework === "nuxt" ? project.next : project.nuxt;
    const files = preferred ?? fallback;
    const actualFramework: PreviewFramework =
      preferred != null ? framework : framework === "nuxt" ? "next" : "nuxt";
    return { files, actualFramework, missingPreferred: !preferred };
  }, [project, framework]);
}

function SandpackStage({
  project,
  framework,
  height,
  showCode,
}: {
  project: BlockSandpackProject;
  framework: PreviewFramework;
  height: number;
  showCode: boolean;
}) {
  const resolved = useResolvedProject(project, framework);
  if (!resolved.files) return null;

  const template =
    resolved.actualFramework === "nuxt" ? "vite-vue-ts" : "vite-react-ts";

  return (
    <SandpackProvider
      key={`${project.blockId}-${resolved.actualFramework}-${height}`}
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
          background: "#fff",
        }}
      >
        {showCode ? (
          <SandpackCodeEditor
            showTabs
            showLineNumbers
            style={{ height }}
          />
        ) : null}
        <SandpackPreview
          showOpenInCodeSandbox
          showRefreshButton
          style={{ height, background: "#fff" }}
        />
      </SandpackLayout>
    </SandpackProvider>
  );
}

export function SandpackBlockPreview({
  project,
  framework,
}: {
  project: BlockSandpackProject;
  framework: PreviewFramework;
}) {
  const [showCode, setShowCode] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const resolved = useResolvedProject(project, framework);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (expanded) {
      if (!el.open) el.showModal();
    } else if (el.open) {
      el.close();
    }
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  if (!resolved.files) {
    return (
      <p className="p-6 text-sm text-muted-foreground">
        No live preview for{" "}
        <code className="font-mono">{project.blockId}</code> yet. Install the
        block with <code className="font-mono">dkit add</code> to use it locally.
      </p>
    );
  }

  const metaLabel = resolved.missingPreferred
    ? `This block ships ${resolved.actualFramework} UI only — showing that variant.`
    : `Live sandbox · ${
        resolved.actualFramework === "nuxt"
          ? "Nuxt / Vue · shadcn-vue tokens"
          : "Next / React · shadcn tokens"
      }`;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <p className="text-xs text-muted-foreground">{metaLabel}</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCode((v) => !v)}
            className="rounded-md border border-border bg-white px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {showCode ? "Hide code" : "Show code"}
          </button>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="rounded-md border border-border bg-white px-2 py-1 text-xs font-medium text-foreground hover:bg-muted"
          >
            Expand
          </button>
        </div>
      </div>

      <SandpackStage
        project={project}
        framework={framework}
        height={showCode ? 360 : 520}
        showCode={showCode}
      />

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 open:flex open:items-center open:justify-center"
        onClose={() => setExpanded(false)}
        onClick={(e) => {
          if (e.target === dialogRef.current) setExpanded(false);
        }}
      >
        <div className="flex max-h-[min(96vh,920px)] w-[min(96vw,1200px)] flex-col overflow-hidden rounded-xl border border-border bg-white shadow-2xl">
          <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div className="min-w-0">
              <h3
                id={titleId}
                className="truncate font-mono text-sm font-semibold text-foreground"
              >
                {project.blockId}
              </h3>
              <p className="truncate text-xs text-muted-foreground">{metaLabel}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCode((v) => !v)}
                className="rounded-md border border-border bg-white px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                {showCode ? "Hide code" : "Show code"}
              </button>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background hover:opacity-90"
              >
                Close
              </button>
            </div>
          </header>
          <div className="min-h-0 flex-1 overflow-auto bg-white p-3">
            {expanded ? (
              <SandpackStage
                project={project}
                framework={framework}
                height={showCode ? 480 : 720}
                showCode={showCode}
              />
            ) : null}
          </div>
        </div>
      </dialog>
    </div>
  );
}
