# UI kit primitives (preview)

Shared component sources injected into Sandpack so block previews resolve `@/components/ui/*` the same way installed apps do.

**Not** what `dkit add` installs — consumers still get real kit pieces via `shadcn` / `shadcn-vue` (or write their own for `minimal`).

```
ui-kits/{kit}/{framework}/
  # next (React): button.tsx, input.tsx, utils.ts, …
  # nuxt (Vue):   Button.vue, Input.vue, … (add when shadcn-vue previews land)
```

www site chrome under `apps/www/components/ui` is separate and can diverge.
