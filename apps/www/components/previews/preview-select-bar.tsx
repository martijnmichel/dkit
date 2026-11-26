"use client";

import { usePreviewPrefs } from "@/components/previews/preview-prefs-context";
import {
  type PreviewFramework,
  type PreviewTheme,
  type PreviewUiKit,
} from "@/lib/preview-prefs";
import { THEME_OPTIONS } from "@/lib/sandpack/themes";

const FRAMEWORK_OPTIONS: Array<{
  value: PreviewFramework;
  label: string;
}> = [
  { value: "next", label: "Next.js" },
  { value: "nuxt", label: "Nuxt" },
];

function uiKitLabel(kit: PreviewUiKit, framework: PreviewFramework): string {
  if (kit === "minimal") return "Minimal";
  return framework === "nuxt" ? "shadcn (Vue)" : "shadcn";
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
  options: Array<{ value: string; label: string; disabled?: boolean }>;
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
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
            {opt.disabled ? " (n/a)" : ""}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Shared framework + UI kit (+ theme when shadcn) selects. */
export function PreviewSelectBar({
  className,
  idPrefix = "preview",
  availableFrameworks,
  availableUiKits,
}: {
  className?: string;
  idPrefix?: string;
  availableFrameworks?: PreviewFramework[];
  availableUiKits?: PreviewUiKit[];
}) {
  const { prefs, setFramework, setUi, setTheme } = usePreviewPrefs();

  const frameworks = availableFrameworks?.length
    ? availableFrameworks
    : (["next", "nuxt"] as PreviewFramework[]);
  const kits = availableUiKits?.length
    ? availableUiKits
    : (["shadcn", "minimal"] as PreviewUiKit[]);

  const activeUi = kits.includes(prefs.ui) ? prefs.ui : kits[0]!;
  const showTheme = activeUi === "shadcn";

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
        value={
          frameworks.includes(prefs.framework)
            ? prefs.framework
            : frameworks[0]!
        }
        options={FRAMEWORK_OPTIONS.map((o) => ({
          ...o,
          disabled: !frameworks.includes(o.value),
        }))}
        onChange={(v) => setFramework(v as PreviewFramework)}
      />
      <SelectField
        id={`${idPrefix}-ui`}
        label="UI kit"
        value={activeUi}
        options={(["shadcn", "minimal"] as PreviewUiKit[]).map((kit) => ({
          value: kit,
          label: uiKitLabel(kit, prefs.framework),
          disabled: !kits.includes(kit),
        }))}
        onChange={(v) => setUi(v as PreviewUiKit)}
      />
      {showTheme ? (
        <SelectField
          id={`${idPrefix}-theme`}
          label="Theme"
          value={prefs.theme}
          options={THEME_OPTIONS}
          onChange={(v) => setTheme(v as PreviewTheme)}
        />
      ) : null}
    </div>
  );
}
