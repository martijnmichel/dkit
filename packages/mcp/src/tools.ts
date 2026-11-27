import {
  loadBlockManifest,
  loadModuleManifest,
  loadRegistryIndex,
  summarizeSnapshot,
} from "./registry.js";

type ToolResult = {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
};

function text(data: unknown): ToolResult {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

function errorText(message: string): ToolResult {
  return {
    content: [{ type: "text", text: message }],
    isError: true,
  };
}

export function listModules() {
  const { index } = loadRegistryIndex();
  const modules = index.items
    .filter((i) => i.type === "dkit:module")
    .map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      version: m.version,
      defaultBlocks: m.defaultBlocks ?? [],
      templates: m.templates,
    }));
  return text({ modules });
}

export function getModule(id: string) {
  const { index, root } = loadRegistryIndex();
  const entry = index.items.find(
    (i) => i.id === id && i.type === "dkit:module",
  );
  if (!entry) {
    return errorText(
      `Unknown module "${id}". Call list_modules for available ids.`,
    );
  }

  const manifest = loadModuleManifest(root, entry.path);
  const schema = summarizeSnapshot(root, entry.path);

  return text({
    id: manifest.id,
    title: manifest.title,
    description: manifest.description,
    version: manifest.version,
    collections: manifest.collections,
    layers: manifest.layers,
    defaultBlocks: manifest.defaultBlocks,
    templates: manifest.templates,
    defaultBasePath: manifest.defaultBasePath,
    registryDependencies: manifest.registryDependencies,
    schema,
    install: {
      command: `npx @kurbo/dkit add ${manifest.id}`,
      withSeed: `npx @kurbo/dkit add ${manifest.id} --seed`,
      schemaOnly: `npx @kurbo/dkit add ${manifest.id} --schema-only`,
      dryRun: `npx @kurbo/dkit add ${manifest.id} --dry-run`,
    },
  });
}

export function listBlocks(moduleId?: string) {
  const { index, root } = loadRegistryIndex();
  let blocks = index.items.filter((i) => i.type === "dkit:block");

  if (moduleId) {
    blocks = blocks.filter((b) =>
      (b.registryDependencies ?? []).includes(moduleId),
    );
  }

  const items = blocks.map((b) => {
    const manifest = loadBlockManifest(root, b.path);
    return {
      id: manifest.id,
      title: manifest.title,
      description: manifest.description,
      version: manifest.version,
      slot: manifest.slot,
      frameworks: manifest.frameworks,
      uiKits: manifest.uiKits,
      registryDependencies: manifest.registryDependencies,
    };
  });

  return text({ blocks: items });
}

export function suggestAdd(input: {
  id: string;
  schemaOnly?: boolean;
  uiOnly?: boolean;
  seed?: boolean;
  dryRun?: boolean;
  yes?: boolean;
  withBlocks?: string[];
  templates?: Record<string, string>;
  path?: string;
  prefix?: string;
  framework?: string;
}) {
  const { index } = loadRegistryIndex();
  const entry = index.items.find((i) => i.id === input.id);
  if (!entry) {
    return errorText(
      `Unknown registry item "${input.id}". Call list_modules or list_blocks.`,
    );
  }

  if (input.templates) {
    for (const [slot, blockId] of Object.entries(input.templates)) {
      const block = index.items.find(
        (i) => i.id === blockId && i.type === "dkit:block",
      );
      if (!block) {
        return errorText(
          `Unknown block "${blockId}" for template slot "${slot}".`,
        );
      }
      if (entry.type === "dkit:module" && entry.templates?.[slot]) {
        const opts =
          entry.templates[slot].options ?? [entry.templates[slot].default];
        if (!opts.includes(blockId)) {
          return errorText(
            `Block "${blockId}" is not an option for slot "${slot}". Options: ${opts.join(", ")}`,
          );
        }
      }
    }
  }

  if (input.withBlocks?.length) {
    for (const blockId of input.withBlocks) {
      if (!index.items.some((i) => i.id === blockId && i.type === "dkit:block")) {
        return errorText(`Unknown block "${blockId}" in withBlocks.`);
      }
    }
  }

  const parts = ["npx", "dkit", "add", input.id];
  if (input.schemaOnly) parts.push("--schema-only");
  if (input.uiOnly) parts.push("--ui-only");
  if (input.seed) parts.push("--seed");
  if (input.dryRun) parts.push("--dry-run");
  if (input.yes) parts.push("--yes");
  if (input.path) parts.push("--path", input.path);
  if (input.prefix !== undefined) parts.push("--prefix", input.prefix);
  if (input.framework) parts.push("--framework", input.framework);
  if (input.withBlocks?.length) {
    parts.push("--with", input.withBlocks.join(","));
  }
  if (input.templates) {
    for (const [slot, blockId] of Object.entries(input.templates)) {
      parts.push("--template", `${slot}=${blockId}`);
    }
  }

  const command = parts
    .map((p) => (/\s/.test(p) ? JSON.stringify(p) : p))
    .join(" ");

  return text({
    command,
    note: "Run this locally with a Directus admin token. MCP does not apply schema.",
    item: {
      id: entry.id,
      type: entry.type,
      title: entry.title,
    },
  });
}
