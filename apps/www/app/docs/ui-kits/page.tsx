import { DocsPage, DocsSection } from "@/components/docs-page";

export default function UiKitsPage() {
  return (
    <DocsPage
      title="UI kits"
      description="Components ship under ui/{kit}/{framework}/. Use shadcn for real @/components/ui pieces, or minimal for plain HTML."
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
            <strong>Component</strong> — e.g. <code>blog-list</code>,{" "}
            <code>blog-detail</code>
          </li>
          <li>
            <strong>Framework</strong> — <code>next</code> | <code>nuxt</code>
          </li>
          <li>
            <strong>UI kit</strong> — <code>shadcn</code> | <code>minimal</code>{" "}
            (declared per block as <code>uiKits</code>)
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
          Blocks import your project&apos;s <code>@/components/ui/*</code>{" "}
          (Button, Input, Card, …) and theme tokens. On Nuxt the same kit id
          means <strong>shadcn-vue</strong>.
        </p>
        <p>
          When you <code>dkit add</code> with <code>uiAdapter: &quot;shadcn&quot;</code>,
          the CLI auto-runs <code>shadcn init --defaults</code> if needed, then{" "}
          <code>shadcn add</code> for any missing components listed on the
          block.
        </p>
      </DocsSection>

      <DocsSection id="minimal" title="minimal">
        <p>
          Semantic HTML + <code>.dkit-prose</code> for rich text. No shadcn
          dependency. Every current registry block ships minimal.
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
