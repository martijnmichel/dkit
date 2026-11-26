import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function BlockFrame({
  title,
  description,
  actions,
  toolbar,
  children,
}: {
  title: string;
  description?: string;
  /** Right side of the component header (e.g. Show code / Expand). */
  actions?: React.ReactNode;
  /** Optional bar under the header (e.g. PreviewSelectBar). */
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="gap-0 overflow-hidden py-0 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-3 bg-muted/40 px-4 py-3 [.border-b]:pb-3">
        <div className="min-w-0 space-y-0.5">
          <CardTitle className="font-mono text-sm">{title}</CardTitle>
          {description ? (
            <CardDescription className="text-[0.8125rem] leading-snug">
              {description}
            </CardDescription>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </CardHeader>
      <Separator />
      {toolbar}
      <CardContent className="preview-canvas min-h-[12rem] p-0">
        {children}
      </CardContent>
    </Card>
  );
}
