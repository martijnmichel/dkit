import { DocsPage, DocsSection } from "@/components/docs-page";
import { JsonLd } from "@/components/json-ld";
import {
  breadcrumbJsonLd,
  pageMetadata,
  webPageJsonLd,
} from "@/lib/seo";
import { Code2, Eye, Layers, Palette, Sparkles } from "lucide-react";

const TITLE = "UI kits";
const DESCRIPTION =
  "Components ship under ui/{kit}/{framework}/. Use shadcn for real @/components/ui pieces, or minimal for plain HTML.";
const PATH = "/docs/ui-kits/";

export const metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function UiKitsPage() {
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
        title="UI kits"
        description={DESCRIPTION}
        icon={Palette}
      toc={[
        { id: "model", label: "Model" },
        { id: "shadcn", label: "shadcn" },
        { id: "minimal", label: "minimal" },
        { id: "preview", label: "Previews" },
      ]}
    >
      <DocsSection id="model" title="Model" icon={Layers}>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Component</strong> — e.g. <code>blog-list</code>,{" "}
            <code>blog-detail</code>
          </li>
          <li>
            <strong>Framework</strong> — <code>next</code>
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

      <DocsSection id="shadcn" title="shadcn" icon={Sparkles}>
        <p>
          Blocks import your project&apos;s <code>@/components/ui/*</code>{" "}
          (Button, Input, Card, …) and theme tokens via shadcn/ui.
        </p>
        <p>
          When you <code>dkit add</code> with <code>uiAdapter: &quot;shadcn&quot;</code>,
          the CLI auto-runs <code>shadcn init --defaults</code> if needed, then{" "}
          <code>shadcn add</code> for any missing components listed on the
          block.
        </p>
      </DocsSection>

      <DocsSection id="minimal" title="minimal" icon={Code2}>
        <p>
          Semantic HTML + <code>.dkit-prose</code> for rich text. No shadcn
          dependency and no Tailwind Preflight — forms and buttons keep
          browser-default styling. Every current registry block ships minimal.
        </p>
      </DocsSection>

      <DocsSection id="preview" title="Previews" icon={Eye}>
        <p>
          On each <a href="/docs/modules/">module page</a>, Sandpack runs the
          real block sources with seed mocks. Preview kit primitives live in the
          registry at <code>ui-kits/&lt;kit&gt;/next/</code> (separate from www
          site chrome). Use UI kit / Theme controls to match your target app.
        </p>
      </DocsSection>
    </DocsPage>
    </>
  );
}
