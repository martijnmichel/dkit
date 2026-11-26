"use client";

import { BlockFrame } from "@/components/previews/block-frame";
import {
  PreviewPrefsProvider,
  usePreviewPrefs,
} from "@/components/previews/preview-prefs-context";
import { PreviewSelectBar } from "@/components/previews/preview-select-bar";
import {
  BlockPreviewActions,
  SandpackBlockPreview,
} from "@/components/previews/sandpack-block";
import type { BlockSandpackProject } from "@/lib/sandpack/types";
import { useCallback, useState } from "react";

export { PreviewPrefsProvider, usePreviewPrefs };

function ModuleBlockCard({ project }: { project: BlockSandpackProject }) {
  const { prefs } = usePreviewPrefs();
  const [showCode, setShowCode] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const onExpandedChange = useCallback((next: boolean) => {
    setExpanded(next);
  }, []);

  return (
    <BlockFrame
      title={project.blockId}
      description={project.description}
      actions={
        <BlockPreviewActions
          showCode={showCode}
          onToggleCode={() => setShowCode((v) => !v)}
          onExpand={() => setExpanded(true)}
        />
      }
      toolbar={
        <PreviewSelectBar
          idPrefix={`block-${project.blockId}`}
          availableFrameworks={project.frameworks}
          availableUiKits={project.uiKits}
        />
      }
    >
      <SandpackBlockPreview
        project={project}
        framework={prefs.framework}
        uiKit={prefs.ui}
        theme={prefs.theme}
        showCode={showCode}
        expanded={expanded}
        onExpandedChange={onExpandedChange}
      />
    </BlockFrame>
  );
}

export function ModuleSandpackPreviews({
  seedHint,
  projects,
}: {
  seedHint?: string | null;
  projects: BlockSandpackProject[];
}) {
  const { ready } = usePreviewPrefs();

  return (
    <div className={ready ? "space-y-8" : "space-y-8 opacity-80"}>
      {seedHint ? (
        <p className="text-sm text-muted-foreground">{seedHint}</p>
      ) : null}
      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No UI components to preview for this module.
        </p>
      ) : (
        projects.map((project) => (
          <ModuleBlockCard key={project.blockId} project={project} />
        ))
      )}
    </div>
  );
}
