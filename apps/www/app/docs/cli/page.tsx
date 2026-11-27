import { DocsPage, DocsSection } from "@/components/docs-page";

export default function CliPage() {
  return (
    <DocsPage
      title="CLI reference"
      description="Commander flags plus interactive prompts. Use --yes for non-interactive CI."
      toc={[
        { id: "init", label: "init" },
        { id: "add", label: "add" },
        { id: "list", label: "list" },
        { id: "doctor", label: "doctor" },
      ]}
    >
      <DocsSection id="init" title="dkit init">
        <p>
          Detects Next/Nuxt (or scaffolds), stores Directus connection and UI
          kit preference in <code className="font-mono">dkit.json</code>.
        </p>
        <pre className="code">{`dkit init
dkit init --url http://localhost:8010 --token <token>
dkit init --yes --url … --token … --ui shadcn`}</pre>
      </DocsSection>

      <DocsSection id="add" title="dkit add">
        <p>
          Applies schema and access, installs TypeScript services as{" "}
          <code className="font-mono">lib/dkit/&lt;module&gt;.ts</code>, and
          copies selected UI components. Pass a <em>module</em> id or a single{" "}
          <em>component</em> id. Optional Directus flows apply automatically;
          sample seed only with <code className="font-mono">--seed</code>. UI
          kit comes from <code className="font-mono">uiAdapter</code>.
        </p>
        <pre className="code">{`# Module — interactive multi-select (defaults pre-selected)
dkit add blog
dkit add blog --seed

# One component — installs the module first if needed
dkit add blog-list-cards
dkit add blog-detail

# Non-interactive picks
dkit add blog --with blog-list-cards,blog-detail
dkit add blog --template list=blog-list-cards
dkit add blog --yes --path /blog --prefix dkit_

dkit add blog --framework nuxt
dkit add blog --schema-only
dkit add blog --dry-run`}</pre>
        <p>
          Interactive module installs ask which components to copy (defaults
          checked), then collection prefix and base path when the module
          declares one. <code className="font-mono">--yes</code> skips prompts
          and installs the default components.
        </p>
      </DocsSection>

      <DocsSection id="list" title="dkit list">
        <p>Prints registry modules, slots, and components.</p>
        <pre className="code">{`dkit list`}</pre>
      </DocsSection>

      <DocsSection id="doctor" title="dkit doctor">
        <p>
          Checks project config and Directus connectivity before you apply
          modules.
        </p>
        <pre className="code">{`dkit doctor`}</pre>
      </DocsSection>
    </DocsPage>
  );
}
