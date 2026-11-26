/** npm deps required by registry ui-kits/shadcn/next inside Sandpack. */
export const SANDPACK_SHADCN_DEPENDENCIES: Record<string, string> = {
  "class-variance-authority": "^0.7.1",
  clsx: "^2.1.1",
  "tailwind-merge": "^3.7.1",
  "radix-ui": "^1.8.1",
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
