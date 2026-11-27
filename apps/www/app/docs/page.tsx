import { DocsNavIconView } from "@/components/docs-nav-icon";
import { DocsPage, DocsSection } from "@/components/docs-page";
import { JsonLd } from "@/components/json-ld";
import { Button } from "@/components/ui/button";
import { DOCS_GUIDES } from "@/lib/docs-nav";
import {
  breadcrumbJsonLd,
  pageMetadata,
  webPageJsonLd,
} from "@/lib/seo";
import { BookOpen, Compass, List } from "lucide-react";

const TITLE = "Documentation";
const DESCRIPTION =
  "Install Directus modules you own — schema, access, flows, and UI — then customize the code in your repo.";
const PATH = "/docs/";

export const metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function DocsIndexPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            title: TITLE,
            description: DESCRIPTION,
            path: PATH,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Docs", path: PATH },
          ]),
        ]}
      />
      <DocsPage
        title="Documentation"
        description={DESCRIPTION}
        icon={BookOpen}
        toc={[
          { id: "start", label: "Start here" },
          { id: "guides", label: "Guides" },
        ]}
      >
      <DocsSection id="start" title="Start here" icon={Compass}>
        <p>
          New to dkit? Work through{" "}
          <a href="/docs/getting-started/">Getting started</a>, then browse{" "}
          <a href="/docs/modules/">modules</a> and install one with{" "}
          <code className="font-mono">dkit add</code>.
        </p>
        <pre className="code">{`npx @kurbo/dkit init
npx @kurbo/dkit add blog --seed`}</pre>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button asChild>
            <a href="/docs/getting-started/">Getting started</a>
          </Button>
          <Button asChild variant="outline">
            <a href="/docs/modules/">Browse modules</a>
          </Button>
        </div>
      </DocsSection>

      <DocsSection id="guides" title="Guides" icon={List}>
        <ul className="space-y-3">
          {DOCS_GUIDES.map((g) => (
            <li key={g.href} className="flex items-start gap-2.5">
              <DocsNavIconView
                icon={g.icon}
                className="mt-0.5 size-4 shrink-0 text-primary"
              />
              <span>
                <a
                  href={g.href}
                  className="font-medium text-foreground underline-offset-2 hover:underline"
                >
                  {g.title}
                </a>
                {g.description ? (
                  <span className="text-muted-foreground">
                    {" "}
                    — {g.description}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      </DocsSection>
    </DocsPage>
    </>
  );
}
