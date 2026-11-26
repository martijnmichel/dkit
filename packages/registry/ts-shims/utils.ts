/** Authoring shim — installed apps use lib/utils.ts */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(" ");
}
