/**
 * Material Symbols icon names used by Directus Data Studio interfaces.
 * Source: directus/directus app/src/interfaces/<id>/index.ts (`icon` field).
 */
export const DIRECTUS_INTERFACE_ICONS: Record<string, string> = {
  boolean: "check_box",
  datetime: "today",
  file: "note_add",
  "file-image": "insert_photo",
  files: "note_add",
  "group-raw": "view_in_ar",
  "group-detail": "view_in_ar",
  "group-accordion": "view_in_ar",
  "group-tabs": "view_in_ar",
  input: "text_fields",
  "input-multiline": "text_fields",
  "input-code": "code",
  "input-hash": "fingerprint",
  "input-rich-text-html": "format_quote",
  "input-rich-text-md": "format_quote",
  "input-block-editor": "box",
  "input-autocomplete-api": "text_fields",
  list: "list",
  "list-m2m": "note_add",
  "list-m2a": "note_add",
  "list-o2m": "arrow_right_alt",
  "list-o2m-tree-view": "account_tree",
  map: "map",
  "presentation-divider": "horizontal_rule",
  "presentation-header": "title",
  "presentation-links": "smart_button",
  "presentation-notice": "info",
  "select-dropdown": "arrow_drop_down_circle",
  "select-dropdown-m2o": "arrow_right_alt",
  "select-multiple-dropdown": "arrow_drop_down_circle",
  "select-radio": "radio_button_checked",
  "select-multiple-checkbox": "checklist",
  "select-multiple-checkbox-tree": "checklist",
  "select-color": "palette",
  "select-icon": "insert_emoticon",
  "select-card": "style",
  slider: "linear_scale",
  tags: "local_offer",
  translations: "translate",
};

/** Fallback when a collection has no meta.icon (Directus default). */
export const DIRECTUS_COLLECTION_FALLBACK_ICON = "box";

/** Folder collections in Directus. */
export const DIRECTUS_FOLDER_ICON = "folder";

export function interfaceIcon(iface?: string | null): string {
  if (!iface) return "tune";
  return DIRECTUS_INTERFACE_ICONS[iface] ?? "tune";
}
