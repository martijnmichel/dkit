import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createDkitMcpServer } from "./server.js";

async function main() {
  const server = createDkitMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("dkit MCP server failed:", err);
  process.exit(1);
});
