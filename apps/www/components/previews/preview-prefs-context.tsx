"use client";

import {
  DEFAULT_PREVIEW_PREFS,
  readPreviewPrefs,
  writePreviewPrefs,
  type PreviewFramework,
  type PreviewPrefs,
  type PreviewUiKit,
} from "@/lib/preview-prefs";
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
