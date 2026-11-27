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
  "Choose shadcn (your @/components/ui) or minimal (plain HTML) when installing dkit blocks into Next.js.";
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
          { id: "choose", label: "Choosing a kit" },
          { id: "shadcn", label: "shadcn" },
          { id: "minimal", label: "minimal" },
          { id: "preview", label: "Live previews" },
        ]}
      >
        <DocsSection id="choose" title="Choosing a kit" icon={Layers}>
          <p>
            Each UI block can ship more than one look. You pick the kit once in{" "}
            <code>dkit.json</code> as <code>uiAdapter</code> (
            <code>shadcn</code> or <code>minimal</code>).{" "}
            <code>npx @kurbo/dkit add</code> installs that variant for Next.js.
          </p>
          <p>
            Module template prompts (for example list vs cards) are layout
            variants — not kit names. If a block does not ship your preferred
            kit, the CLI falls back to one it does.
          </p>
        </DocsSection>

        <DocsSection id="shadcn" title="shadcn" icon={Sparkles}>
          <p>
            Blocks use your app&apos;s existing{" "}
            <code>@/components/ui/*</code> primitives (Button, Input, Card, …)
            and theme tokens from shadcn/ui.
          </p>
          <p>
            With <code>uiAdapter: &quot;shadcn&quot;</code>,{" "}
            <code>dkit add</code> runs <code>shadcn init --defaults</code> when
            needed, then <code>shadcn add</code> for any components the block
            lists that are missing from your project.
          </p>
        </DocsSection>

        <DocsSection id="minimal" title="minimal" icon={Code2}>
          <p>
            Plain semantic HTML plus <code>.dkit-prose</code> for rich text. No
            shadcn install and no Tailwind Preflight — forms and buttons keep
            the browser defaults. Every current block includes a minimal
            variant.
          </p>
        </DocsSection>

        <DocsSection id="preview" title="Live previews" icon={Eye}>
          <p>
            On each <a href="/docs/modules/">module page</a>, interactive
            Sandpack previews run the same block sources you would install,
            backed by that module&apos;s seed data. Use the UI kit and Theme
            controls to match how your app is set up.
          </p>
        </DocsSection>
      </DocsPage>
    </>
  );
}
