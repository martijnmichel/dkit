import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getModule, listBlocks, listModules, suggestAdd } from "./tools.js";

export function createDkitMcpServer(): McpServer {
  const server = new McpServer({
    name: "dkit",
    version: "0.1.0",
  });

  server.registerTool(
    "list_modules",
    {
      title: "List modules",
      description:
        "List dkit registry modules with ids, descriptions, default blocks, and template slots.",
      inputSchema: {},
    },
    async () => listModules(),
  );

  server.registerTool(
    "get_module",
    {
      title: "Get module",
      description:
        "Module details: collections, layers, template slots, schema field summary, and sample install commands.",
      inputSchema: {
        id: z
          .string()
          .min(1)
          .describe('Module id, e.g. "blog" or "contact-form"'),
      },
    },
    async ({ id }) => getModule(id),
  );

  server.registerTool(
    "list_blocks",
    {
      title: "List blocks",
      description:
        "List UI blocks with frameworks, uiKits, and slots. Optionally filter by parent module id.",
      inputSchema: {
        moduleId: z
          .string()
          .optional()
          .describe('Filter blocks that depend on this module, e.g. "blog"'),
      },
    },
    async ({ moduleId }) => listBlocks(moduleId),
  );

  server.registerTool(
    "suggest_add",
    {
      title: "Suggest dkit add",
      description:
        "Build a safe `npx dkit add …` command (supports --dry-run, --seed, templates). Does not run the CLI or apply schema.",
      inputSchema: {
        id: z
          .string()
          .min(1)
          .describe("Module or block id to install"),
        schemaOnly: z
          .boolean()
          .optional()
          .describe("Apply Directus layers only (no UI)"),
        uiOnly: z
          .boolean()
          .optional()
          .describe("Copy UI only"),
        seed: z
          .boolean()
          .optional()
          .describe("Include --seed"),
        dryRun: z
          .boolean()
          .optional()
          .describe("Include --dry-run (recommended first)"),
        yes: z
          .boolean()
          .optional()
          .describe("Include --yes for non-interactive runs"),
        withBlocks: z
          .array(z.string())
          .optional()
          .describe("Explicit block ids (--with)"),
        templates: z
          .record(z.string())
          .optional()
          .describe('Slot overrides, e.g. { "list": "blog-list-cards" }'),
        path: z
          .string()
          .optional()
          .describe("Route base path (--path)"),
        prefix: z
          .string()
          .optional()
          .describe("Collection prefix (--prefix)"),
        framework: z
          .enum(["next", "nuxt"])
          .optional()
          .describe("UI framework adapter"),
      },
    },
    async (args) => suggestAdd(args),
  );

  return server;
}
