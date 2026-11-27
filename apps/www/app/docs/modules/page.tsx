import { DirectusIcon } from "@/components/directus-icon";
import { JsonLd } from "@/components/json-ld";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getModuleIcon, getRegistry } from "@/lib/registry";
import {
  breadcrumbJsonLd,
  pageMetadata,
  webPageJsonLd,
} from "@/lib/seo";

const TITLE = "Modules";
const DESCRIPTION =
  "Browse installable Directus modules — schema, access, services, and UI you own after dkit add.";
const PATH = "/docs/modules/";

export const metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function ModulesPage() {
  const registry = getRegistry();
  const modules = registry.items
    .filter((i) => i.type === "dkit:module")
    .map((m) => ({ ...m, icon: getModuleIcon(m.id) }));

  return (
    <div className="px-6 py-10 lg:px-10">
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
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        Modules
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Each module applies schema and access to your Directus instance. Install
        a module (interactive component select) or a single component id with{" "}
        <code className="font-mono text-sm">npx @kurbo/dkit add &lt;id&gt;</code>.
      </p>

      <div className="mt-8 space-y-2 md:hidden">
        {modules.map((m) => (
          <a
            key={m.id}
            href={`/docs/modules/${m.id}/`}
            className="block no-underline hover:no-underline"
          >
            <Card className="transition-colors hover:border-primary/40">
              <CardHeader className="gap-2">
                <div className="flex items-center gap-2.5">
                  <DirectusIcon name={m.icon} size="md" className="text-primary" />
                  <CardTitle className="text-base">{m.title}</CardTitle>
                </div>
                <CardDescription>{m.description}</CardDescription>
                <p className="pt-1 font-mono text-xs text-muted-foreground">
                  {m.id}
                </p>
              </CardHeader>
            </Card>
          </a>
        ))}
      </div>

      <div className="mt-10 hidden grid-cols-2 gap-4 md:grid xl:grid-cols-3">
        {modules.map((m) => (
          <a
            key={m.id}
            href={`/docs/modules/${m.id}/`}
            className="block no-underline hover:no-underline"
          >
            <Card className="h-full transition-colors hover:border-primary/40">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <DirectusIcon
                      name={m.icon}
                      size="md"
                      className="text-primary"
                    />
                    <CardTitle className="text-base">{m.title}</CardTitle>
                  </div>
                  <Badge variant="outline">v{m.version}</Badge>
                </div>
                <CardDescription>{m.description}</CardDescription>
                <p className="pt-2 font-mono text-sm text-muted-foreground">
                  {m.id}
                </p>
              </CardHeader>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
