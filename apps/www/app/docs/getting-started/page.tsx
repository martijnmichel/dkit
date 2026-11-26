import { DocsPage, DocsSection } from "@/components/docs-page";
import { Button } from "@/components/ui/button";

export default function GettingStartedPage() {
  return (
    <DocsPage
      title="Getting started"
      description="Go from an empty folder (or an existing Next/Nuxt app) to a module running against your Directus project."
      toc={[
        { id: "prereqs", label: "Prerequisites" },
        { id: "init", label: "Init" },
        { id: "add", label: "Add a module" },
        { id: "next", label: "What you get" },
      ]}
    >
      <DocsSection id="prereqs" title="Prerequisites">
        <ul className="list-disc space-y-2 pl-5">
          <li>Node 20+</li>
          <li>
            Directus <strong>11+</strong> (12.2+ recommended for additive schema
            merge)
          </li>
          <li>
            A <strong>static admin token</strong> from Directus (User → Token)
          </li>
        </ul>
      </DocsSection>

      <DocsSection id="init" title="Init your app">
        <p>
          <code className="font-mono">dkit init</code> detects Next or Nuxt, or
          scaffolds one if the folder is empty. It writes{" "}
          <code className="font-mono">dkit.json</code> with your Directus URL,
          framework, and preferred UI kit.
        </p>
        <pre className="code">{`npx dkit init --url http://localhost:8010 --token <token>`}</pre>
      </DocsSection>

      <DocsSection id="add" title="Add a module">
        <p>
          Pick a module from the{" "}
          <a href="/docs/modules/">module directory</a>, then install schema,
          access, and UI in one command:
        </p>
        <pre className="code">{`npx dkit add blog --seed`}</pre>
        <p>
          Interactive mode asks for a collection prefix and route base path.
          Use <code className="font-mono">--yes</code> for CI.
        </p>
        <Button asChild variant="outline">
          <a href="/docs/cli/">CLI reference →</a>
        </Button>
      </DocsSection>

      <DocsSection id="next" title="What you get">
        <ul className="list-disc space-y-2 pl-5">
          <li>Collections, relations, and policies on Directus</li>
          <li>
            Owned files under <code className="font-mono">lib/dkit/</code> and{" "}
            <code className="font-mono">components/dkit/</code>
          </li>
          <li>
            Optional seed data so list/detail UI works immediately (
            <code className="font-mono">--seed</code>)
          </li>
        </ul>
        <p>
          UI kits and themes: <a href="/docs/ui-kits/">UI kits</a>. Agent
          tooling: <a href="/docs/mcp/">MCP server</a>.
        </p>
      </DocsSection>
    </DocsPage>
  );
}
