import { ServiceExportsList } from "@/components/service-exports-list";
import {
  getModuleLibDoc,
  primaryServiceExports,
} from "@/lib/module-lib-docs";
import { Library } from "lucide-react";

export async function ModuleServicesReference({
  moduleId,
}: {
  moduleId: string;
}) {
  const doc = getModuleLibDoc(moduleId);
  if (!doc) {
    return (
      <section id="services" className="scroll-mt-24 space-y-3">
        <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground">
          <Library className="size-5 text-primary" aria-hidden />
          Services
        </h2>
        <p className="text-sm text-muted-foreground">
          This module does not ship a <code>lib.ts</code> yet.
        </p>
      </section>
    );
  }

  const exports = primaryServiceExports(doc);

  return (
    <section id="services" className="scroll-mt-24 space-y-4">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground">
          <Library className="size-5 text-primary" aria-hidden />
          Services
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Fetch and write helpers installed as <code>{doc.installPath}</code>.
          Import from <code>@/lib/dkit/{moduleId}</code>. See{" "}
          <a href="/docs/services/">Services</a>.
        </p>
      </div>

      <ServiceExportsList exports={exports} />
    </section>
  );
}
