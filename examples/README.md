# Examples

Local playgrounds for re-testing `dkit` installs against Directus.

| App | Port | Status | Commands |
|-----|------|--------|----------|
| [next](./next) | 3001 | **Supported** | `pnpm example:next:setup` → `pnpm example:next:dev` |
| [nuxt](./nuxt) | 3002 | Internal only (CLI gated) | see `examples/nuxt/README.md` |

Both need Directus running and `DIRECTUS_TOKEN` set:

```bash
pnpm directus:up
export DIRECTUS_TOKEN=<static-admin-token>
```

Clear generated Next UI anytime with `pnpm example:next:clear`.
Wipe the Directus database with `pnpm directus:reset`.
