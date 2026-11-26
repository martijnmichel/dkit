# dkit

**Install Directus modules you own** — schema, permissions, flows, and Next.js UI blocks in one command.

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
dkit add blog                 # module + default blocks
dkit add blog --schema-only   # Directus only
dkit add blog-detail          # one UI block (+ module if missing)
dkit add blog --with list,detail
dkit add blog --dry-run
dkit list
dkit doctor
```

## Develop

```bash
pnpm install
pnpm --filter @dkit/shared build
pnpm --filter @dkit/schema build
pnpm --filter dkit build
pnpm --filter @dkit/www dev
```

## Deploy docs (Ubuntu + Docker)

1. Point your domain DNS at the VPS.
2. Put Caddy/Traefik in front for TLS.
3. CI pushes `ghcr.io/<you>/dkit-www` on changes to `apps/www` / registry.
4. On the server: `docker compose -f deploy/compose.yaml pull && up -d`

## Auth

Install-time auth uses a **static admin token** (or email/password then paste a token). Browser OAuth is not used for schema apply — Directus MCP OAuth only covers `/mcp`, not Admin API schema endpoints.

## License

MIT
