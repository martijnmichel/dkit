# UI kit primitives (preview)

Shared component sources injected into Sandpack so block previews resolve `@/components/ui/*` the same way installed apps do.

**Not** what `dkit add` installs — consumers still get real kit pieces via `shadcn` (or write their own for `minimal`).

```
ui-kits/{kit}/{framework}/
  # next (React): button.tsx, … — lightweight stand-ins for Sandpack
  # nuxt (Vue):   button/, … — present in repo; public CLI/previews are Next-only for now
```

www site chrome under `apps/www/components/ui` is separate and can diverge.
