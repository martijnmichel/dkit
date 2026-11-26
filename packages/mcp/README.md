# @dkit/mcp

MCP server for discovering dkit modules and drafting `dkit add` commands. Uses the same registry as the CLI. Does not apply Directus schema — that stays on the CLI with an admin token.

Docs: [dkit.run](https://dkit.run)

## Tools

| Tool | Purpose |
| --- | --- |
| `list_modules` | Registry modules + descriptions |
| `get_module` | Schema summary, slots, default blocks, install examples |
| `list_blocks` | Blocks, `uiKits`, frameworks (optional `moduleId` filter) |
| `suggest_add` | Build a safe `npx dkit add …` string (`--dry-run` friendly) |

## Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "dkit": {
      "command": "npx",
      "args": ["-y", "@dkit/mcp"]
    }
  }
}
```

From this monorepo (after `pnpm --filter @dkit/mcp build`):

```json
{
  "mcpServers": {
    "dkit": {
      "command": "node",
      "args": ["packages/mcp/dist/bin.js"]
    }
  }
}
```

## Dev

```bash
pnpm --filter @dkit/mcp build
pnpm --filter @dkit/mcp test
```
