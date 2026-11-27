/** npm deps for real example-next shadcn (base-nova / Base UI) inside Sandpack. */
export const SANDPACK_SHADCN_DEPENDENCIES: Record<string, string> = {
  "@base-ui/react": "^1.9.0",
  "class-variance-authority": "^0.7.1",
  clsx: "^2.1.1",
  "tailwind-merge": "^3.7.1",
  "lucide-react": "^0.511.0",
};

/**
 * npm deps for registry ui-kits/shadcn/nuxt inside Sandpack.
 * Preview kit is intentionally dependency-light (no reka-ui) so the bundler
 * does not TIME_OUT; installed apps still get real shadcn-vue via the CLI.
 */
export const SANDPACK_SHADCN_VUE_DEPENDENCIES: Record<string, string> = {
  "class-variance-authority": "^0.7.1",
  clsx: "^2.1.1",
  "tailwind-merge": "^3.7.1",
};
