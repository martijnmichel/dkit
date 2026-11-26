# dkit

**Install Directus modules you own** — schema, permissions, flows, and frontend UI blocks (Next.js + Nuxt) in one command.

```bash
# one-time: put `dkit` on your PATH from this repo
pnpm dkit:link

dkit init                 # auto-detects Next/Nuxt (or scaffolds if folder is empty)
dkit add blog --seed
```

`dkit init` detects the framework from `package.json` / config files. In an empty folder it asks Next vs Nuxt and runs `create-next-app` or `nuxi init` with defaults.

Requires **Directus 11+** (best on **12.2+** for additive schema merge). Always back up or use a staging instance before applying modules.

**Directus 12 Core (no license):** public permissions use flat rules (`fields: ["*"]`). Row filters / field subsets need a Directus license; UI blocks already filter `status = published` in queries.

## Packages

| Path | Purpose |
|------|---------|
| `packages/cli` | Published npm package `dkit` |
| `packages/mcp` | MCP server `@dkit/mcp` (registry discover + `dkit add` drafts) |
| `packages/schema` | Schema / policies / flows / seed apply |
| `packages/shared` | Manifest + `dkit.json` Zod schemas |
| `packages/registry` | Modules (`dkit:module`) + UI blocks (`dkit:block`) |
| `apps/www` | Docs / preview site (static export → Docker/nginx) |
| `docker/directus` | Ephemeral local Directus for testing |

## Local Directus

```bash
pnpm directus:up      # http://localhost:8010 (v11 profile → :8011)
# admin@example.com / dkit-admin
pnpm directus:reset   # wipe volumes + restart
```

Create a **static admin token** in Directus (User → Token), then in a Next.js app:

```bash
npx dkit init --url http://localhost:8010 --token <token>
npx dkit add blog --seed
```

## Install modes

```bash
dkit add blog
dkit add blog --template list=blog-list-cards
dkit add blog --with blog-list-cards,blog-detail
dkit add blog --framework nuxt
dkit add blog --schema-only
dkit add blog --dry-run
dkit add blog --yes --path /blog --prefix dkit_   # CI / non-interactive
dkit list
dkit doctor
```

Blog ships multiple **component variants per slot** (`list`, `detail`). UI kit (`shadcn` | `minimal`) comes from `dkit.json` `uiAdapter`. Defaults are used unless you pass `--template` or `--with`.

Interactive `dkit add` **always asks** for:

- **Collection prefix** (default `dkit_` from `dkit.json`, e.g. `posts` → `dkit_posts`)
- **Route base path** whenever the module declares one (e.g. `/blog`) — not only on conflicts

Generated `lib/dkit/config.ts` exposes `collections` and `moduleBasePath()` for UI blocks.

## Local CLI

```bash
pnpm install
pnpm dkit:link          # build + pnpm link --global → `dkit` on PATH
dkit --help
dkit init               # prompts for URL + token (flags only prefill)
dkit init --yes --url … --token …   # CI / non-interactive

# without global link:
pnpm dkit --help
```

Stack: **Commander** (commands/flags) + **@clack/prompts** (interactive questions).

Anonymous CLI usage (command name, flags, version — no paths/tokens) goes to Umami. Opt out: `DKIT_TELEMETRY=0`, `DO_NOT_TRACK=1`, or `dkit --no-telemetry …`.

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

# Nuxt playground (:3002) — see examples/nuxt/README.md
pnpm example:nuxt:setup
pnpm example:nuxt:dev
pnpm example:nuxt:clear
pnpm example:nuxt:reset
```

`directus:reset` wipes the Directus DB volumes for a clean schema re-apply.

## Auth

Install-time auth uses a **static admin token** (or email/password then paste a token). Browser OAuth is not used for schema apply — Directus MCP OAuth only covers `/mcp`, not Admin API schema endpoints.

## License

MIT
