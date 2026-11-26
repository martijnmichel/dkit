"use client";

import { BlockFrame } from "@/components/previews/block-frame";
import {
  PreviewPrefsProvider,
  usePreviewPrefs,
} from "@/components/previews/preview-prefs-context";
import { PreviewSelectBar } from "@/components/previews/preview-select-bar";
import { SandpackBlockPreview } from "@/components/previews/sandpack-block";
import type { BlockSandpackProject } from "@/lib/sandpack/types";

export { PreviewPrefsProvider, usePreviewPrefs };

export function ModuleSandpackPreviews({
  seedHint,
  projects,
}: {
  seedHint?: string | null;
  projects: BlockSandpackProject[];
}) {
  const { prefs, ready } = usePreviewPrefs();

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
          <BlockFrame
            key={project.blockId}
            title={project.blockId}
            description={project.description}
            toolbar={
              <PreviewSelectBar
                idPrefix={`block-${project.blockId}`}
                availableFrameworks={project.frameworks}
                availableUiKits={project.uiKits}
              />
            }
          >
            <div className="p-3">
              <SandpackBlockPreview
                project={project}
                framework={prefs.framework}
                uiKit={prefs.ui}
                theme={prefs.theme}
              />
            </div>
          </BlockFrame>
        ))
      )}
    </div>
  );
}
