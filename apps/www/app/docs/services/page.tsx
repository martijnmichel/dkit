import { DocsPage, DocsSection } from "@/components/docs-page";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listModuleServices } from "@/lib/services-docs";

export default function ServicesPage() {
  const modules = listModuleServices().filter((m) => m.hasServices);

  return (
    <DocsPage
      title="Services"
      description="Optional Directus flows and seed data shipped with modules — applied from services/ when you run dkit add."
      toc={[
        { id: "overview", label: "Overview" },
        { id: "flows", label: "Flows" },
        { id: "seed", label: "Seed" },
        { id: "modules", label: "By module" },
      ]}
    >
      <DocsSection id="overview" title="Overview">
        <p>
          Modules can include a <code>services/</code> layer next to schema and
          access. That layer is optional per module and never required to use
          the UI blocks.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <code>flows.json</code> — Directus flows (and operations) created on{" "}
            <code>dkit add</code>
          </li>
          <li>
            <code>seed.json</code> — sample files + items imported only with{" "}
            <code>--seed</code>
          </li>
        </ul>
        <pre className="code">{`npx dkit add blog --seed
npx dkit add contact-form`}</pre>
      </DocsSection>

      <DocsSection id="flows" title="Flows">
        <p>
          Flows are applied with the rest of the module. Some ship{" "}
          <strong>inactive</strong> so you can enable them after configuring
          Directus (for example email / SMTP). Check each module page for the
          exact flow name, trigger, and collections.
        </p>
      </DocsSection>

      <DocsSection id="seed" title="Seed">
        <p>
          Seed is create-or-update by stable id — safe to re-run. Use it to
          smoke-test list/detail UI, then replace or delete the sample content
          in Directus before production.
        </p>
        <p>
          Without <code>--seed</code>, schema and UI still install; collections
          start empty.
        </p>
      </DocsSection>

      <DocsSection id="modules" title="By module">
        <p className="text-muted-foreground">
          Exact contents from each module&apos;s <code>services/</code> files:
        </p>
        <div className="mt-4 space-y-4">
          {modules.map((m) => (
            <Card key={m.moduleId}>
              <CardHeader className="pb-0">
                <CardTitle className="text-base">
                  <a href={`/docs/modules/${m.moduleId}/`}>{m.title}</a>
                </CardTitle>
                <CardDescription>
                  <code>{m.moduleId}</code>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {m.flows.length > 0 ? (
                  <div>
                    <p className="font-medium text-foreground">Flows</p>
                    <ul className="mt-1 space-y-1 text-muted-foreground">
                      {m.flows.map((f) => (
                        <li key={f.name}>
                          {f.name}
                          {f.status ? (
                            <Badge
                              variant="outline"
                              className="ml-2 font-mono text-[0.65rem]"
                            >
                              {f.status}
                            </Badge>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {m.seedFiles.length > 0 || m.seedCollections.length > 0 ? (
                  <div>
                    <p className="font-medium text-foreground">Seed</p>
                    <ul className="mt-1 space-y-1 text-muted-foreground">
                      {m.seedFiles.length > 0 ? (
                        <li>
                          {m.seedFiles.length} file
                          {m.seedFiles.length === 1 ? "" : "s"}
                          {": "}
                          {m.seedFiles
                            .map((f) => f.title ?? f.filename_download)
                            .join(", ")}
                        </li>
                      ) : null}
                      {m.seedCollections.map((c) => (
                        <li key={c.collection}>
                          <code>{c.collection}</code> — {c.count} item
                          {c.count === 1 ? "" : "s"} (
                          {c.items.map((i) => i.label).join(", ")})
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </DocsSection>
    </DocsPage>
  );
}
