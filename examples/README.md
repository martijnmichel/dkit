# Examples

Local playgrounds for re-testing `dkit` installs.

| App | Port | Commands |
|-----|------|----------|
| [next](./next) | 3001 | `pnpm example:next:setup` → `pnpm example:next:dev` |
| [nuxt](./nuxt) | 3002 | `pnpm example:nuxt:setup` → `pnpm example:nuxt:dev` |

Both need Directus running and `DIRECTUS_TOKEN` set:

```bash
pnpm directus:up
export DIRECTUS_TOKEN=<static-admin-token>
```

Clear generated UI anytime with `pnpm example:next:clear` / `pnpm example:nuxt:clear`.
Wipe the Directus database with `pnpm directus:reset`.
