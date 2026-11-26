# dkit — Nuxt example

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
| `components/dkit/**` | Nuxt Vue blocks from the registry |
| `lib/dkit/**` | Shared TypeScript types |
| `dkit.json` | Project config (`framework: "nuxt"`) |
| `.env.local` / `.env` | `DIRECTUS_URL` + token |

Those paths are gitignored — re-run setup after clone.

## Pages

- `/` — setup instructions  
- `/blog` — list template (`BlogList` or `BlogListCards`)  
- `/blog/:slug` — detail template (`BlogDetail` or `BlogDetailMinimal`)
