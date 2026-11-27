import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getRegistry } from "@/lib/registry";

export default function ModulesPage() {
  const registry = getRegistry();
  const modules = registry.items.filter((i) => i.type === "dkit:module");

  return (
    <div className="px-6 py-10 lg:px-10">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        Modules
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Each module applies schema and access to your Directus instance, then
        drops matching UI into your app. Install with{" "}
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
              <CardHeader className="gap-1">
                <CardTitle className="text-base">{m.title}</CardTitle>
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
                  <CardTitle className="text-base">{m.title}</CardTitle>
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
