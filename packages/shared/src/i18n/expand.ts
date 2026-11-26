import {
  COLLECTION_LABEL_CATALOG,
  FIELD_LABEL_CATALOG,
} from "./catalog.js";
import {
  DKIT_LOCALES,
  DKIT_SOURCE_LOCALE,
  type DkitLocale,
} from "./locales.js";

export type FieldTranslation = {
  language: string;
  translation: string;
};

export type CollectionTranslation = {
  language: string;
  translation: string;
  singular?: string;
  plural?: string;
};

type CatalogLocale = Exclude<DkitLocale, "en-US">;

function translateFieldLabel(en: string, locale: CatalogLocale): string {
  return FIELD_LABEL_CATALOG[en]?.[locale] ?? en;
}

function translateCollectionForms(
  en: CollectionTranslation,
  locale: CatalogLocale,
): CollectionTranslation {
  const hit = COLLECTION_LABEL_CATALOG[en.translation]?.[locale];
  return {
    language: locale,
    translation: hit?.translation ?? en.translation,
    singular: hit?.singular ?? en.singular ?? en.translation,
    plural: hit?.plural ?? en.plural ?? en.translation,
  };
}

/** Expand field translations from en-US to all DKIT_LOCALES. */
export function expandFieldTranslations(
  existing: FieldTranslation[] | null | undefined,
): FieldTranslation[] {
  const list = Array.isArray(existing) ? existing : [];
  const byLang = new Map(list.map((t) => [t.language, t]));
  const source =
    byLang.get(DKIT_SOURCE_LOCALE) ??
    list[0] ??
    ({ language: DKIT_SOURCE_LOCALE, translation: "" } as FieldTranslation);
  if (!source.translation) return list;

  return DKIT_LOCALES.map((locale) => {
    const explicit = byLang.get(locale);
    if (explicit?.translation) return explicit;
    if (locale === DKIT_SOURCE_LOCALE) {
      return {
        language: locale,
        translation: source.translation,
      };
    }
    const catalogLocale = locale as CatalogLocale;
    return {
      language: catalogLocale,
      translation: translateFieldLabel(source.translation, catalogLocale),
    };
  });
}

/** Expand collection translations (incl. singular/plural) to all DKIT_LOCALES. */
export function expandCollectionTranslations(
  existing: CollectionTranslation[] | null | undefined,
): CollectionTranslation[] {
  const list = Array.isArray(existing) ? existing : [];
  const byLang = new Map(list.map((t) => [t.language, t]));
  const source =
    byLang.get(DKIT_SOURCE_LOCALE) ??
    list[0] ??
    ({
      language: DKIT_SOURCE_LOCALE,
      translation: "",
    } as CollectionTranslation);
  if (!source.translation) return list;

  return DKIT_LOCALES.map((locale) => {
    const explicit = byLang.get(locale);
    if (explicit?.translation) {
      return {
        language: locale,
        translation: explicit.translation,
        singular: explicit.singular ?? explicit.translation,
        plural: explicit.plural ?? explicit.translation,
      };
    }
    if (locale === DKIT_SOURCE_LOCALE) {
      return {
        language: locale,
        translation: source.translation,
        singular: source.singular ?? source.translation,
        plural: source.plural ?? source.translation,
      };
    }
    return translateCollectionForms(source, locale as CatalogLocale);
  });
}

/** Deep-expand translations on collection + field meta (mutates a shallow copy). */
export function expandMetaTranslations(
  meta: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null | undefined {
  if (!meta) return meta;
  const next: Record<string, unknown> = { ...meta };
  if ("translations" in next) {
    const tr = next.translations;
    if (Array.isArray(tr) && tr[0] && typeof tr[0] === "object") {
      const sample = tr[0] as Record<string, unknown>;
      if ("singular" in sample || "plural" in sample) {
        next.translations = expandCollectionTranslations(
          tr as CollectionTranslation[],
        );
      } else {
        next.translations = expandFieldTranslations(tr as FieldTranslation[]);
      }
    }
  }
  return next;
}
