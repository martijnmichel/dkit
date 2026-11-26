"use client";

import {
  DEFAULT_PREVIEW_PREFS,
  readPreviewPrefs,
  selectBlocksForUiKit,
  writePreviewPrefs,
  type PreviewFramework,
  type PreviewPrefs,
  type PreviewUiKit,
} from "@/lib/preview-prefs";
import type { BlockSandpackProject } from "@/lib/sandpack/build-project";
import { BlockFrame } from "@/components/previews/block-frame";
import { SandpackBlockPreview } from "@/components/previews/sandpack-block";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const PreviewPrefsContext = createContext<{
  prefs: PreviewPrefs;
  setFramework: (framework: PreviewFramework) => void;
  setUi: (ui: PreviewUiKit) => void;
  ready: boolean;
} | null>(null);

export function PreviewPrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<PreviewPrefs>(DEFAULT_PREVIEW_PREFS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPrefs(readPreviewPrefs());
    setReady(true);
  }, []);

  const commit = useCallback((next: PreviewPrefs) => {
    setPrefs(next);
    writePreviewPrefs(next);
  }, []);

  const value = useMemo(
    () => ({
      prefs,
      ready,
      setFramework: (framework: PreviewFramework) =>
        commit({ ...prefs, framework }),
      setUi: (ui: PreviewUiKit) => commit({ ...prefs, ui }),
    }),
    [prefs, ready, commit],
  );

  return (
    <PreviewPrefsContext.Provider value={value}>
      {children}
    </PreviewPrefsContext.Provider>
  );
}

export function usePreviewPrefs() {
  const ctx = useContext(PreviewPrefsContext);
  if (!ctx) {
    throw new Error("usePreviewPrefs must be used within PreviewPrefsProvider");
  }
  return ctx;
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string; hint?: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
      <span className="w-24 shrink-0 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <div
        role="group"
        aria-label={label}
        className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5"
      >
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              title={opt.hint}
              aria-pressed={active}
              onClick={() => onChange(opt.value)}
              className={
                active
                  ? "rounded-md bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm"
                  : "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PreviewControls() {
  const { prefs, setFramework, setUi } = usePreviewPrefs();

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <Segmented
        label="Framework"
        value={prefs.framework}
        onChange={setFramework}
        options={[
          { value: "next", label: "Next.js", hint: "React · shadcn/ui tokens" },
          { value: "nuxt", label: "Nuxt", hint: "Vue · shadcn-vue tokens" },
        ]}
      />
      <Segmented
        label="UI kit"
        value={prefs.ui}
        onChange={setUi}
        options={[
          {
            value: "shadcn",
            label: prefs.framework === "nuxt" ? "shadcn-vue" : "shadcn",
            hint: "Theme tokens",
          },
          { value: "minimal", label: "Minimal", hint: "Semantic HTML + prose" },
        ]}
      />
    </div>
  );
}

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
    <div className="space-y-6">
      <PreviewControls />

      <p className="text-sm text-muted-foreground">
        Your framework and UI kit choice is remembered in this browser. Previews
        run in{" "}
        <a
          href="https://sandpack.codesandbox.io/"
          className="text-primary underline-offset-4 hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          Sandpack
        </a>
        .
        {seedHint ? ` ${seedHint}` : null}
      </p>

      <div className={ready ? "space-y-8" : "space-y-8 opacity-80"}>
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
    </div>
  );
}
