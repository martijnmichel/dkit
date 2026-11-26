import { DocsPage, DocsSection } from "@/components/docs-page";
import { ServiceExportsList } from "@/components/service-exports-list";
import {
  listModuleLibDocs,
  primaryServiceExports,
} from "@/lib/module-lib-docs";

export default async function ServicesPage() {
  const modules = listModuleLibDocs();

  return (
    <DocsPage
      title="Services"
      description="TypeScript helpers installed with each module — fetch posts, pages, submit forms — as lib/dkit/<module>.ts you own."
      toc={[
        { id: "overview", label: "Overview" },
        { id: "install", label: "Install" },
        ...modules.map((m) => ({ id: m.moduleId, label: m.title })),
      ]}
    >
      <DocsSection id="overview" title="Overview">
        <p>
          Services are the query and action functions in each module&apos;s{" "}
          <code>lib.ts</code>. After <code>dkit add</code>, they live in your
          app as <code>lib/dkit/&lt;module&gt;.ts</code> (plus types). UI blocks
          import them; you can call the same helpers from your own routes.
        </p>
        <p>
          Naming is <code>getBlogPosts</code>, <code>getBlogPostBySlug</code>,{" "}
          <code>getPageBuilderPages</code>, and so on. List helpers take an
          options object (
          <code>getBlogPosts(&#123; limit, status, category &#125;)</code>).
          They use your project&apos;s <code>@/lib/dkit/client</code> and{" "}
          <code>collections</code> only; you own and edit the files.
        </p>
        <p>
          Directus flows and sample seed data are separate — they ship under{" "}
          <code>services/</code> in the registry and show on each module page as{" "}
          <strong>Flows &amp; seed</strong>.
        </p>
      </DocsSection>

      <DocsSection id="install" title="Install">
        <pre className="code">{`npx dkit add blog
# → lib/dkit/blog.ts
# → lib/dkit/blog.types.ts

import { getBlogPosts } from "@/lib/dkit/blog";`}</pre>
      </DocsSection>

      {modules.map((m) => {
        const exports = primaryServiceExports(m);
        return (
          <DocsSection key={m.moduleId} id={m.moduleId} title={m.title}>
            <p className="text-muted-foreground">
              <code>{m.installPath}</code>
              {" · "}
              <a href={`/docs/modules/${m.moduleId}/`}>Module page</a>
            </p>
            <div className="mt-4">
              <ServiceExportsList exports={exports} />
            </div>
          </DocsSection>
        );
      })}
    </DocsPage>
  );
}
