import { DocsPage, DocsSection } from "@/components/docs-page";
import { JsonLd } from "@/components/json-ld";
import {
  breadcrumbJsonLd,
  pageMetadata,
  webPageJsonLd,
} from "@/lib/seo";
import { Bot, Database, Plug, Wrench } from "lucide-react";

const TITLE = "MCP server";
const DESCRIPTION =
  "Registry tools for coding agents — discover modules and draft install commands without scraping the site.";
const PATH = "/docs/mcp/";

export const metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function McpPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ title: TITLE, description: DESCRIPTION, path: PATH }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Docs", path: "/docs/" },
            { name: TITLE, path: PATH },
          ]),
        ]}
      />
      <DocsPage
        title="MCP server"
        description={DESCRIPTION}
        icon={Bot}
      toc={[
        { id: "setup", label: "Setup" },
        { id: "tools", label: "Tools" },
        { id: "directus", label: "Directus MCP" },
      ]}
    >
      <DocsSection id="setup" title="Setup" icon={Plug}>
        <p>
          Package <code>@dkit/mcp</code> speaks MCP over stdio. It wraps the
          same registry the CLI uses. It does <strong>not</strong> apply schema
          — agents draft commands; you run{" "}
          <code>dkit add</code> with a static admin token locally or in CI.
        </p>
        <p>Cursor <code>.cursor/mcp.json</code>:</p>
        <pre className="code">{`{
  "mcpServers": {
    "dkit": {
      "command": "npx",
      "args": ["-y", "@dkit/mcp"]
    }
  }
}`}</pre>
      </DocsSection>

      <DocsSection id="tools" title="Tools" icon={Wrench}>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <code>list_modules</code> — registry modules + descriptions
          </li>
          <li>
            <code>get_module</code> — schema summary, slots, default blocks,
            install examples
          </li>
          <li>
            <code>list_blocks</code> — blocks, <code>uiKits</code>, frameworks
            (optional <code>moduleId</code> filter)
          </li>
          <li>
            <code>suggest_add</code> — build a safe{" "}
            <code>dkit add …</code> string (<code>--dry-run</code> friendly)
          </li>
        </ul>
      </DocsSection>

      <DocsSection id="directus" title="Directus MCP" icon={Database}>
        <p>
          Directus exposes an <code>/mcp</code> endpoint for content and query
          workflows. OAuth scoped to MCP does <strong>not</strong> authorize
          Admin API schema, policies, or flows — that is why{" "}
          <code>dkit add</code> still needs a <strong>static admin token</strong>{" "}
          (see <a href="/docs/getting-started/">Getting started</a>).
        </p>
        <p>
          Use Directus MCP alongside dkit for content; keep schema installs on
          the CLI. <code>@dkit/mcp</code> is registry discovery only.
        </p>
      </DocsSection>
    </DocsPage>
    </>
  );
}
