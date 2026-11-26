"use client";

import { Button } from "@/components/ui/button";
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
import {
  SANDPACK_SHADCN_DEPENDENCIES,
  SANDPACK_SHADCN_VUE_DEPENDENCIES,
} from "@/lib/sandpack/ui-kit-deps";
import type { BlockSandpackProject } from "@/lib/sandpack/types";
import { resolveProjectUiKit } from "@/lib/sandpack/types";
import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import { useEffect, useId, useMemo, useRef } from "react";

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
        bundlerTimeOut: 120_000,
        externalResources: [
          "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4",
        ],
      }}
      customSetup={{
        dependencies: {
          ...(resolved.actualFramework === "nuxt"
            ? {}
            : { react: "^19.0.0", "react-dom": "^19.0.0" }),
          ...(resolved.actualKit === "shadcn"
            ? resolved.actualFramework === "nuxt"
              ? SANDPACK_SHADCN_VUE_DEPENDENCIES
              : SANDPACK_SHADCN_DEPENDENCIES
            : {}),
        },
      }}
    >
      <SandpackLayout
        style={{
          border: "none",
          borderRadius: 0,
          overflow: "hidden",
          background: "#fff",
        }}
      >
        {showCode ? (
          <SandpackCodeEditor showTabs showLineNumbers style={{ height }} />
        ) : null}
        <SandpackPreview
          showNavigator={false}
          showOpenInCodeSandbox={false}
          showRefreshButton={false}
          showRestartButton={false}
          style={{ height, background: "#fff" }}
        />
      </SandpackLayout>
    </SandpackProvider>
  );
}

export function BlockPreviewActions({
  showCode,
  onToggleCode,
  onExpand,
}: {
  showCode: boolean;
  onToggleCode: () => void;
  onExpand: () => void;
}) {
  return (
    <>
      <Button type="button" variant="outline" size="xs" onClick={onToggleCode}>
        {showCode ? "Hide code" : "Show code"}
      </Button>
      <Button type="button" variant="outline" size="xs" onClick={onExpand}>
        Expand
      </Button>
    </>
  );
}

export function SandpackBlockPreview({
  project,
  framework,
  uiKit,
  theme,
  showCode,
  expanded,
  onExpandedChange,
}: {
  project: BlockSandpackProject;
  framework: PreviewFramework;
  uiKit: PreviewUiKit;
  theme: PreviewTheme;
  showCode: boolean;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}) {
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
      if (e.key === "Escape") onExpandedChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded, onExpandedChange]);

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
      ? (THEME_PRESETS[theme]?.label ?? theme)
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
    <div>
      {fallbackNote ? (
        <p className="border-b border-border px-4 py-2 text-xs text-muted-foreground">
          {fallbackNote}
        </p>
      ) : null}

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
        onClose={() => onExpandedChange(false)}
        onClick={(e) => {
          if (e.target === dialogRef.current) onExpandedChange(false);
        }}
      >
        <div className="flex max-h-[min(96vh,920px)] w-[min(96vw,1200px)] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
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
            <Button
              type="button"
              size="xs"
              onClick={() => onExpandedChange(false)}
            >
              Close
            </Button>
          </header>
          <div className="preview-canvas min-h-0 flex-1 overflow-auto">
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
