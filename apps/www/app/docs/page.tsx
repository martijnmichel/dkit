import { DocsPage, DocsSection } from "@/components/docs-page";
import { Button } from "@/components/ui/button";
import { DOCS_GUIDES } from "@/lib/docs-nav";

export default function DocsIndexPage() {
  return (
    <DocsPage
      title="Documentation"
      description="Install Directus modules you own — schema, access, flows, and UI — then customize the code in your repo."
      toc={[
        { id: "start", label: "Start here" },
        { id: "guides", label: "Guides" },
      ]}
    >
      <DocsSection id="start" title="Start here">
        <p>
          New to dkit? Work through{" "}
          <a href="/docs/getting-started/">Getting started</a>, then browse{" "}
          <a href="/docs/modules/">modules</a> and install one with{" "}
          <code className="font-mono">dkit add</code>.
        </p>
        <pre className="code">{`npx dkit init
npx dkit add blog --seed`}</pre>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button asChild>
            <a href="/docs/getting-started/">Getting started</a>
          </Button>
          <Button asChild variant="outline">
            <a href="/docs/modules/">Browse modules</a>
          </Button>
        </div>
      </DocsSection>

      <DocsSection id="guides" title="Guides">
        <ul className="space-y-3">
          {DOCS_GUIDES.map((g) => (
            <li key={g.href}>
              <a
                href={g.href}
                className="font-medium text-foreground underline-offset-2 hover:underline"
              >
                {g.title}
              </a>
              {g.description ? (
                <span className="text-muted-foreground"> — {g.description}</span>
              ) : null}
            </li>
          ))}
        </ul>
      </DocsSection>
    </DocsPage>
  );
}
