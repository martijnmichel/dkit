"use client";

import { usePreviewPrefs } from "@/components/previews/preview-prefs-context";
import {
  type PreviewFramework,
  type PreviewUiKit,
} from "@/lib/preview-prefs";

const FRAMEWORK_OPTIONS: Array<{
  value: PreviewFramework;
  label: string;
}> = [
  { value: "next", label: "Next.js" },
  { value: "nuxt", label: "Nuxt" },
];

function uiKitOptions(framework: PreviewFramework): Array<{
  value: PreviewUiKit;
  label: string;
}> {
  return [
    {
      value: "shadcn",
      label: framework === "nuxt" ? "shadcn-vue" : "shadcn",
    },
    { value: "minimal", label: "Minimal" },
  ];
}

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-w-0 items-center gap-2">
      <span className="shrink-0 text-[0.6875rem] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 min-w-[7.5rem] flex-1 cursor-pointer rounded-md border border-border bg-white px-2 text-sm text-foreground shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Shared framework + UI kit selects (synced via PreviewPrefsProvider / localStorage). */
export function PreviewSelectBar({
  className,
  idPrefix = "preview",
}: {
  className?: string;
  idPrefix?: string;
}) {
  const { prefs, setFramework, setUi } = usePreviewPrefs();

  return (
    <div
      className={
        className ??
        "flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border bg-zinc-50/80 px-4 py-2.5"
      }
    >
      <SelectField
        id={`${idPrefix}-framework`}
        label="Framework"
        value={prefs.framework}
        options={FRAMEWORK_OPTIONS}
        onChange={(v) => setFramework(v as PreviewFramework)}
      />
      <SelectField
        id={`${idPrefix}-ui`}
        label="UI kit"
        value={prefs.ui}
        options={uiKitOptions(prefs.framework)}
        onChange={(v) => setUi(v as PreviewUiKit)}
      />
    </div>
  );
}
