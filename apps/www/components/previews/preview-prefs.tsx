"use client";

import { BlockFrame } from "@/components/previews/block-frame";
import {
  PreviewPrefsProvider,
  usePreviewPrefs,
} from "@/components/previews/preview-prefs-context";
import { PreviewSelectBar } from "@/components/previews/preview-select-bar";
import { SandpackBlockPreview } from "@/components/previews/sandpack-block";
import { selectBlocksForUiKit } from "@/lib/preview-prefs";
import type { BlockSandpackProject } from "@/lib/sandpack/build-project";
import { useMemo } from "react";

export { PreviewPrefsProvider, usePreviewPrefs };

export function ModuleSandpackPreviews({
  seedHint,
  projects,
}: {
  seedHint?: string | null;
  projects: BlockSandpackProject[];
}) {
  const { prefs, ready } = usePreviewPrefs();

  const visible = useMemo(
    () => selectBlocksForUiKit(projects, prefs.ui),
    [projects, prefs.ui],
  );

  return (
    <div className={ready ? "space-y-8" : "space-y-8 opacity-80"}>
      {seedHint ? (
        <p className="text-sm text-muted-foreground">{seedHint}</p>
      ) : null}
      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No blocks match this UI kit. Try shadcn, or install with{" "}
          <code className="font-mono">--template</code> for other options.
        </p>
      ) : (
        visible.map((project) => (
          <BlockFrame
            key={project.blockId}
            title={project.blockId}
            description={project.description}
            toolbar={
              <PreviewSelectBar idPrefix={`block-${project.blockId}`} />
            }
          >
            <div className="p-3">
              <SandpackBlockPreview
                project={project}
                framework={prefs.framework}
              />
            </div>
          </BlockFrame>
        ))
      )}
    </div>
  );
}
