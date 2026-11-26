import { ModulesSidebar } from "@/components/modules-sidebar";
import { getRegistry } from "@/lib/registry";

export default function ModulesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const modules = getRegistry()
    .items.filter((i) => i.type === "dkit:module")
    .map((m) => ({ id: m.id, title: m.title }));

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-7xl">
      <div className="sticky top-0 hidden h-[calc(100vh-0px)] w-56 shrink-0 overflow-y-auto border-r border-border md:block lg:w-60">
        <ModulesSidebar modules={modules} />
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
