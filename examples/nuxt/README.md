# dkit — Nuxt example (internal)

> **Not in the published CLI yet.** `@kurbo/dkit` currently supports Next.js only.
> This playground is for monorepo contributors re-enabling Nuxt later.

Playground to install / clear / re-test Nuxt UI blocks against local Directus.

## Quick start (from repo root)

```bash
pnpm directus:up
# Data Studio → User → create static token
export DIRECTUS_TOKEN=<token>

pnpm example:nuxt:setup      # init + dkit add blog --framework nuxt --seed
pnpm example:nuxt:dev        # http://localhost:3002

# alternate templates
pnpm --filter @dkit/example-nuxt dkit:add-blog-cards

# wipe generated files and re-install
pnpm example:nuxt:clear
pnpm example:nuxt:reset

# wipe Directus DB too
pnpm directus:reset && pnpm example:nuxt:setup
```

## What gets generated

| Path | Source |
|------|--------|
| `components/dkit/<module>/*.vue` | UI blocks (e.g. `blog/BlogList.vue`) |
| `components/ui/*` | shadcn-vue primitives (via `dkit add`) |
| `lib/dkit/<module>.ts` | Queries/actions |
| `styles/dkit/prose.css` | Shared `.dkit-prose` rich-text styles |
| `components.json` / `dkit.json` | shadcn + dkit project config |
| `.env.local` / `.env` | `DIRECTUS_URL` + token |

Those generated paths are gitignored — re-run setup after clone.

## Pages

- `/` — setup instructions  
- `/blog` — list template (`BlogList` or `BlogListCards`)  
- `/blog/:slug` — detail template (`BlogDetail` or `BlogDetailMinimal`)
