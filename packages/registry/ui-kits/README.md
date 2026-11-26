# UI kit primitives (preview)

Shared component sources injected into Sandpack so block previews resolve `@/components/ui/*` the same way installed apps do.

**Not** what `dkit add` installs — consumers still get real kit pieces via `shadcn` / `shadcn-vue` (or write their own for `minimal`).

```
ui-kits/{kit}/{framework}/
  # next (React): button.tsx, … — lightweight stand-ins for Sandpack
  # nuxt (Vue):   button/, … — lightweight stand-ins (no reka-ui) for Sandpack
```

www site chrome under `apps/www/components/ui` is separate and can diverge.
