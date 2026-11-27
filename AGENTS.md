# AGENTS

## Audience

`apps/www` and published docs/copy are for **developers installing dkit into their own Next/Nuxt + Directus project**.

- Write for `npx @kurbo/dkit` / `npm i -g @kurbo/dkit` consumers.
- Do **not** document monorepo contributor workflows (`pnpm dkit:link`, `pnpm directus:up`, working from this repo) on the site.
- Contributor setup belongs in the root `README.md` only.
- If a docs page only makes sense for people hacking on dkit itself, do not ship it — remove it or fold consumer-facing bits into Getting started / CLI / MCP.

## Product copy

- Never leave agent planning language, “planned”, “status notes”, or “ask if you want X next” in user-facing UI or docs.
- **Installed UI** (registry blocks, scaffolded pages) is seen by the **site visitor**, not the developer. No Directus/inbox/CLI/setup notes in that copy — write normal product/site text.

## Module services (`packages/registry/modules/*/lib.ts`)

**Services** = owned TypeScript fetch/write helpers installed as `lib/dkit/<module>.ts`.  
**Not** Directus flows/seed — those live under the registry `services/` folder and are labeled **Flows & seed** in docs.

When adding or changing a module:

1. **Naming** — `get{Module}{Resource}` / `BySlug` / `ById` (e.g. `getBlogPosts`, `getBlogAuthorBySlug`, `getPageBuilderPages`). If the module id *is* the resource (`pages`), use `getPages` / `getPageBySlug` (no doubling). Writes: `{verb}{Module}{Resource}` (`createContactSubmission`).
2. **Options object** — list/detail helpers take options (`{ limit, status, category, sort }`), not new positional args. Default `status` to `"published"`; allow `status: null` to skip.
3. **Thin shared client only** — use `@/lib/dkit/client` + `@/lib/dkit/config.collections`. Do not put queries in a published runtime package; ship editable `lib.ts`.
4. **Never reinvent client helpers** — modules must **not** define `getDirectus`, `getClient`, `directusFileId`, `directusAssetUrl`, or any other Directus client/asset helper. Import them from `@/lib/dkit/client` only (CLI generates that file once for the project).
5. **Completeness** — export list + bySlug + byId for each owned collection even if unused by UI yet.

Also see `.cursor/rules/module-services.mdc`.

## shadcn composition (Radix vs Base UI)

Do **not** patch installed shadcn components. Read `components.json` → `style`:

- `base-*` → Base UI → composition via `render` / `nativeButton={false}`
- `new-york`, `radix-*`, `default`, … → Radix → composition via `asChild`

Registry shadcn/Next blocks are authored with `asChild`. On `dkit add`, the CLI rewrites them for Base UI styles when needed.
