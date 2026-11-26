/**
 * Locales expanded onto every Directus collection/field translation at apply time.
 * Schemas only need en-US; other locales come from the catalog (fallback: en-US).
 */
export const DKIT_LOCALES = [
  "en-US",
  "en-GB",
  "nl-NL",
  "de-DE",
  "fr-FR",
  "es-ES",
  "pt-BR",
  "it-IT",
  "ja-JP",
  "zh-CN",
] as const;

export type DkitLocale = (typeof DKIT_LOCALES)[number];

export const DKIT_SOURCE_LOCALE: DkitLocale = "en-US";
