/** Shapes from dkit.rest snapshot.json */

export type SchemaTranslation = {
  language?: string;
  translation?: string;
  singular?: string;
  plural?: string;
};

export type SchemaField = {
  field: string;
  type?: string;
  meta?: {
    interface?: string | null;
    display?: string | null;
    special?: string[] | null;
    width?: string | null;
    sort?: number | null;
    hidden?: boolean | null;
    readonly?: boolean | null;
    required?: boolean | null;
    note?: string | null;
    options?: Record<string, unknown> | null;
    display_options?: Record<string, unknown> | null;
    conditions?: Array<{
      name?: string;
      rule?: unknown;
      required?: boolean;
      hidden?: boolean;
    }> | null;
    validation?: unknown;
    validation_message?: string | null;
    translations?: SchemaTranslation[] | null;
  } | null;
  schema?: {
    is_primary_key?: boolean;
    is_nullable?: boolean;
    is_unique?: boolean;
    default_value?: unknown;
    max_length?: number | null;
    length?: number | null;
    data_type?: string;
    foreign_key_table?: string | null;
    foreign_key_column?: string | null;
  } | null;
};

export type SchemaCollection = {
  collection: string;
  schema?: Record<string, unknown> | null;
  meta?: {
    icon?: string | null;
    color?: string | null;
    group?: string | null;
    note?: string | null;
    display_template?: string | null;
    archive_field?: string | null;
    archive_value?: string | null;
    unarchive_value?: string | null;
    archive_app_filter?: boolean | null;
    sort?: number | null;
    singleton?: boolean | null;
    hidden?: boolean | null;
    translations?: SchemaTranslation[] | null;
  } | null;
  fields?: SchemaField[];
};

export type SchemaRelation = {
  collection: string;
  field: string;
  related_collection?: string | null;
  meta?: Record<string, unknown> | null;
  schema?: { on_delete?: string | null } | null;
};

export type RestSchemaDoc = {
  format?: string;
  collections?: SchemaCollection[];
  relations?: SchemaRelation[];
};

export function enLabel(
  translations?: SchemaTranslation[] | null,
  fallback = "",
): string {
  const en = translations?.find((t) => t.language === "en-US");
  return en?.translation ?? fallback;
}

export function formatChoices(meta: SchemaField["meta"]): string | null {
  const opts = meta?.options as { choices?: Array<{ text?: string; value?: string }> } | null;
  const choices = opts?.choices;
  if (!choices?.length) return null;
  return choices.map((c) => c.value ?? c.text ?? "?").join(" | ");
}

export function fieldFlags(field: SchemaField): string[] {
  const flags: string[] = [];
  if (field.schema?.is_primary_key) flags.push("pk");
  if (field.meta?.required || field.schema?.is_nullable === false) flags.push("required");
  if (field.schema?.is_unique) flags.push("unique");
  if (field.meta?.hidden) flags.push("hidden");
  if (field.meta?.readonly) flags.push("readonly");
  if (field.meta?.special?.length) flags.push(...field.meta.special);
  return flags;
}
