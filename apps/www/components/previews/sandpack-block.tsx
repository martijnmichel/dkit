"use client";

import type {
  PreviewFramework,
  PreviewTheme,
  PreviewUiKit,
} from "@/lib/preview-prefs";
import {
  buildSandpackMinimalCss,
  buildSandpackThemeCss,
  THEME_PRESETS,
  withSandpackThemeCss,
} from "@/lib/sandpack/themes";
import type { BlockSandpackProject } from "@/lib/sandpack/types";
import { resolveProjectUiKit } from "@/lib/sandpack/types";
import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

function frameworkLabel(fw: PreviewFramework): string {
  return fw === "nuxt" ? "Nuxt" : "Next";
}

function kitLabel(kit: PreviewUiKit, fw: PreviewFramework): string {
  if (kit === "minimal") return "minimal";
  return fw === "nuxt" ? "shadcn (Vue)" : "shadcn";
}

function useResolvedVariant(
  project: BlockSandpackProject,
  framework: PreviewFramework,
  uiKit: PreviewUiKit,
  theme: PreviewTheme,
) {
  return useMemo(() => {
    const actualKit = resolveProjectUiKit(project, uiKit);
    const variant = project.variants[actualKit];
    const preferredFw =
      framework === "nuxt" ? variant?.nuxt : variant?.next;
    const fallbackFw =
      framework === "nuxt" ? variant?.next : variant?.nuxt;
    const baseFiles = preferredFw ?? fallbackFw ?? null;
    const actualFramework: PreviewFramework =
      preferredFw != null
        ? framework
        : framework === "nuxt"
          ? "next"
          : "nuxt";

    const css =
      actualKit === "minimal"
        ? buildSandpackMinimalCss()
        : buildSandpackThemeCss(theme);
    const files = baseFiles ? withSandpackThemeCss(baseFiles, css) : null;

    return {
      files,
      actualFramework,
      actualKit,
      kitFallback: actualKit !== uiKit,
      frameworkFallback: preferredFw == null && fallbackFw != null,
    };
  }, [project, framework, uiKit, theme]);
}

function SandpackStage({
  project,
  framework,
  uiKit,
  theme,
  height,
  showCode,
}: {
  project: BlockSandpackProject;
  framework: PreviewFramework;
  uiKit: PreviewUiKit;
  theme: PreviewTheme;
  height: number;
  showCode: boolean;
}) {
  const resolved = useResolvedVariant(project, framework, uiKit, theme);
  if (!resolved.files) return null;

  const template =
    resolved.actualFramework === "nuxt" ? "vite-vue-ts" : "vite-react-ts";

  return (
    <SandpackProvider
      key={`${project.blockId}-${resolved.actualFramework}-${resolved.actualKit}-${theme}-${height}`}
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
          <SandpackCodeEditor showTabs showLineNumbers style={{ height }} />
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
  uiKit,
  theme,
}: {
  project: BlockSandpackProject;
  framework: PreviewFramework;
  uiKit: PreviewUiKit;
  theme: PreviewTheme;
}) {
  const [showCode, setShowCode] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const resolved = useResolvedVariant(project, framework, uiKit, theme);

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
        <code className="font-mono">{project.blockId}</code> with this
        framework / UI kit.
      </p>
    );
  }

  const themeLabel =
    resolved.actualKit === "shadcn"
      ? THEME_PRESETS[theme]?.label ?? theme
      : null;

  const metaLabel = [
    frameworkLabel(resolved.actualFramework),
    kitLabel(resolved.actualKit, resolved.actualFramework),
    themeLabel,
  ]
    .filter(Boolean)
    .join(" · ");

  const fallbackNote = resolved.kitFallback
    ? `This component ships ${project.uiKits.join(" / ")} only — showing ${resolved.actualKit}.`
    : resolved.frameworkFallback
      ? `No ${framework} UI — showing ${resolved.actualFramework}.`
      : null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <p className="text-xs text-muted-foreground">
          {fallbackNote ?? metaLabel}
        </p>
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
        uiKit={uiKit}
        theme={theme}
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
              <p className="truncate text-xs text-muted-foreground">
                {fallbackNote ?? metaLabel}
              </p>
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
                uiKit={uiKit}
                theme={theme}
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
