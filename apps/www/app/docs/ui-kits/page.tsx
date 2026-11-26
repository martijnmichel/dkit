import { DocsPage, DocsSection } from "@/components/docs-page";

export default function UiKitsPage() {
  return (
    <DocsPage
      title="UI kits"
      description="Components ship under ui/{kit}/{framework}/. Prefer minimal for any codebase; add shadcn when you want polished tokens."
      toc={[
        { id: "model", label: "Model" },
        { id: "shadcn", label: "shadcn" },
        { id: "minimal", label: "minimal" },
        { id: "preview", label: "Previews" },
      ]}
    >
      <DocsSection id="model" title="Model">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Component</strong> — e.g. <code className="font-mono">blog-list</code>,{" "}
            <code className="font-mono">blog-detail</code>
          </li>
          <li>
            <strong>Framework</strong> — <code className="font-mono">next</code> |{" "}
            <code className="font-mono">nuxt</code>
          </li>
          <li>
            <strong>UI kit</strong> — <code className="font-mono">shadcn</code> |{" "}
            <code className="font-mono">minimal</code> (declared per block as{" "}
            <code className="font-mono">uiKits</code>)
          </li>
        </ul>
        <p>
          Module <code>templates</code> options are variants (list vs cards),
          never kit ids. <code>dkit.json</code>
          {" → "}
          <code>uiAdapter</code> is the preferred kit; CLI falls back if a
          block does not ship it.
        </p>
      </DocsSection>

      <DocsSection id="shadcn" title="shadcn">
        <p>
          Theme tokens only (<code className="font-mono">bg-background</code>,{" "}
          <code className="font-mono">text-primary</code>, …). On Nuxt the same
          kit id means <strong>shadcn-vue</strong>. Module previews can switch
          Neutral / Zinc / Stone / dkit themes in the sandbox.
        </p>
      </DocsSection>

      <DocsSection id="minimal" title="minimal">
        <p>
          Semantic HTML + <code className="font-mono">.dkit-prose</code> for
          rich text. Fits apps that are not on shadcn. Every current registry
          block ships minimal.
        </p>
      </DocsSection>

      <DocsSection id="preview" title="Previews">
        <p>
          On each <a href="/docs/modules/">module page</a>, Sandpack runs the
          real block sources with seed mocks. Use Framework / UI kit / Theme
          controls to match your target app.
        </p>
      </DocsSection>
    </DocsPage>
  );
}
