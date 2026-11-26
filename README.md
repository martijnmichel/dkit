# dkit

**Install Directus modules you own** — schema, permissions, flows, and frontend UI blocks (Next.js + Nuxt) in one command.

```bash
npx dkit init
npx dkit add blog --seed
```

Requires **Directus 11+** (best on **12.2+** for additive schema merge). Always back up or use a staging instance before applying modules.

## Packages

| Path | Purpose |
|------|---------|
| `packages/cli` | Published npm package `dkit` |
| `packages/schema` | Schema / policies / flows / seed apply |
| `packages/shared` | Manifest + `dkit.json` Zod schemas |
| `packages/registry` | Modules (`dkit:module`) + UI blocks (`dkit:block`) |
| `apps/www` | Docs / preview site (static export → Docker/nginx) |
| `docker/directus` | Ephemeral local Directus for testing |

## Local Directus

```bash
pnpm directus:up      # http://localhost:8055
# admin@example.com / dkit-admin
pnpm directus:reset   # wipe volumes + restart
```

Create a **static admin token** in Directus (User → Token), then in a Next.js app:

```bash
npx dkit init --url http://localhost:8055 --token <token>
npx dkit add blog --seed
```

## Install modes

```bash
dkit add blog
dkit add blog --template list=blog-list-cards,detail=blog-detail-minimal
dkit add blog --with blog-list-cards,blog-detail
dkit add blog --framework nuxt
dkit add blog --schema-only
dkit add blog --dry-run
dkit list
dkit doctor
```

Blog ships multiple **templates per slot** (`list`, `detail`). Defaults are used unless you pass `--template` or `--with`.

## Develop

```bash
pnpm install
pnpm --filter @dkit/shared build
pnpm --filter @dkit/schema build
pnpm --filter dkit build
pnpm --filter @dkit/www dev
```

## Example apps (re-testable)

```bash
pnpm directus:up
export DIRECTUS_TOKEN=<static-admin-token>

# Next.js playground (:3001)
pnpm example:next:setup
pnpm --filter @dkit/example-next dev
pnpm example:next:clear    # wipe generated components/dkit + lib/dkit
pnpm example:next:reset    # clear + re-add blog

# Nuxt playground (:3002)
pnpm example:nuxt:setup
pnpm --filter @dkit/example-nuxt dev
pnpm example:nuxt:clear
pnpm example:nuxt:reset
```

`directus:reset` wipes the Directus DB volumes for a clean schema re-apply.

## Deploy docs (Ubuntu + Docker)

1. Point your domain DNS at the VPS.
2. Put Caddy/Traefik in front for TLS.
3. CI pushes `ghcr.io/<you>/dkit-www` on changes to `apps/www` / registry.
4. On the server: `docker compose -f deploy/compose.yaml pull && up -d`

## Auth

Install-time auth uses a **static admin token** (or email/password then paste a token). Browser OAuth is not used for schema apply — Directus MCP OAuth only covers `/mcp`, not Admin API schema endpoints.

## License

MIT
