"use client";

import { DirectusIcon } from "@/components/directus-icon";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DIRECTUS_COLLECTION_FALLBACK_ICON,
  DIRECTUS_FOLDER_ICON,
  interfaceIcon,
} from "@/lib/directus-icons";
import {
  enLabel,
  fieldFlags,
  formatChoices,
  type SchemaCollection,
  type SchemaField,
  type SchemaRelation,
} from "@/lib/schema-docs";
import type { ReactNode } from "react";

function collectionIconName(collection: SchemaCollection): string {
  if (collection.schema === null) {
    return collection.meta?.icon || DIRECTUS_FOLDER_ICON;
  }
  return collection.meta?.icon || DIRECTUS_COLLECTION_FALLBACK_ICON;
}

function CollectionMeta({ collection }: { collection: SchemaCollection }) {
  const meta = collection.meta;
  const isFolder = collection.schema === null;
  const label = enLabel(meta?.translations, collection.collection);
  const icon = collectionIconName(collection);

  const rows: Array<[string, ReactNode]> = [
    ["Key", collection.collection],
    ["Label", label],
  ];
  if (isFolder) rows.push(["Kind", "folder (no table)"]);
  rows.push([
    "Icon",
    <span key="icon" className="inline-flex items-center gap-2">
      <DirectusIcon name={icon} size="sm" className="text-foreground" />
      <span className="font-mono text-[0.8125rem]">{icon}</span>
    </span>,
  ]);
  if (meta?.color) rows.push(["Color", meta.color]);
  if (meta?.group) rows.push(["Group", meta.group]);
  if (meta?.display_template) rows.push(["Display", meta.display_template]);
  if (meta?.archive_field) {
    rows.push([
      "Archive",
      `${meta.archive_field}: ${meta.archive_value ?? "?"} ↔ ${meta.unarchive_value ?? "?"}`,
    ]);
  }
  if (meta?.singleton) rows.push(["Singleton", "yes"]);
  if (meta?.note) rows.push(["Note", meta.note]);

  return (
    <dl className="grid gap-x-4 gap-y-2.5 text-sm sm:grid-cols-[7rem_1fr]">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-[0.8125rem] font-medium text-muted-foreground">
            {k}
          </dt>
          <dd className="break-all text-[0.8125rem] text-foreground [&:not(:has(.material-symbols-outlined))]:font-mono">
            {v}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function SetupBlock({ field }: { field: SchemaField }) {
  const flags = fieldFlags(field);
  const choices = formatChoices(field.meta);
  const details: Array<[string, string]> = [];

  if (choices) details.push(["Options", choices]);
  if (field.schema?.default_value != null) {
    details.push(["Default", JSON.stringify(field.schema.default_value)]);
  }
  if (field.meta?.validation) {
    details.push([
      "Validation",
      field.meta.validation_message?.trim() || "custom rule",
    ]);
  }
  if (field.meta?.conditions?.length) {
    details.push([
      "Conditions",
      field.meta.conditions.map((c) => c.name ?? "condition").join(", "),
    ]);
  }
  if (field.meta?.note) details.push(["Note", field.meta.note]);

  if (!flags.length && !details.length) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <div className="space-y-2.5">
      {flags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {flags.map((f) => (
            <Badge key={f} variant="secondary" className="font-mono text-[0.6875rem]">
              {f}
            </Badge>
          ))}
        </div>
      ) : null}
      {details.length > 0 ? (
        <dl className="space-y-1.5">
          {details.map(([k, v]) => (
            <div
              key={k}
              className="grid grid-cols-1 gap-0.5 sm:grid-cols-[5.75rem_minmax(0,1fr)] sm:gap-x-3"
            >
              <dt className="text-[0.75rem] font-medium text-muted-foreground">
                {k}
              </dt>
              <dd className="font-mono text-[0.8125rem] leading-snug break-words text-foreground/90">
                {v}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}

function FieldRow({ field }: { field: SchemaField }) {
  const label = enLabel(field.meta?.translations, field.field);
  const iface = field.meta?.interface;
  const width = field.meta?.width;
  const ifaceIcon = interfaceIcon(iface);

  return (
    <tr className="align-top border-t border-border">
      <td className="py-4 pr-4">
        <div className="font-mono text-sm font-medium text-foreground">
          {field.field}
        </div>
        {label !== field.field ? (
          <div className="mt-1 text-[0.8125rem] text-muted-foreground">
            {label}
          </div>
        ) : null}
      </td>
      <td className="py-4 pr-4">
        <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.75rem] text-foreground">
          {field.type ?? "—"}
        </code>
      </td>
      <td className="py-4 pr-4 text-[0.8125rem] leading-snug">
        <div className="flex items-center gap-2 text-foreground">
          <DirectusIcon
            name={ifaceIcon}
            size="sm"
            className="text-muted-foreground"
            title={iface ?? undefined}
          />
          <span className="font-mono">{iface ?? "—"}</span>
        </div>
        {width ? (
          <div className="mt-1 pl-6 text-muted-foreground">{width}</div>
        ) : null}
      </td>
      <td className="py-4">
        <SetupBlock field={field} />
      </td>
    </tr>
  );
}

function RelationsList({
  collection,
  relations,
}: {
  collection: string;
  relations: SchemaRelation[];
}) {
  const related = relations.filter((r) => r.collection === collection);
  if (!related.length) return null;
  return (
    <div className="mt-6">
      <h4 className="text-sm font-semibold text-foreground">Relations</h4>
      <ul className="mt-3 space-y-2">
        {related.map((r) => (
          <li
            key={`${r.collection}.${r.field}`}
            className="rounded-md bg-muted/50 px-3 py-2 font-mono text-[0.8125rem]"
          >
            <span className="text-foreground">
              {r.field} → {r.related_collection ?? "?"}
            </span>
            {r.schema?.on_delete ? (
              <span className="text-muted-foreground">
                {" "}
                · on_delete {r.schema.on_delete}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SchemaCollectionsAccordion({
  collections,
  relations,
}: {
  collections: SchemaCollection[];
  relations: SchemaRelation[];
}) {
  if (!collections.length) return null;

  return (
    <Accordion
      type="multiple"
      className="rounded-xl border border-border bg-card px-4 shadow-sm"
    >
      {collections.map((collection) => {
        const fields = [...(collection.fields ?? [])].sort(
          (a, b) => (a.meta?.sort ?? 0) - (b.meta?.sort ?? 0),
        );
        const title = enLabel(
          collection.meta?.translations,
          collection.collection,
        );
        const fieldCount = fields.length;
        const isFolder = collection.schema === null;

        return (
          <AccordionItem
            key={collection.collection}
            value={collection.collection}
          >
            <AccordionTrigger className="hover:no-underline">
              <span className="flex min-w-0 flex-1 items-center gap-3 pr-2 text-left">
                <DirectusIcon
                  name={collectionIconName(collection)}
                  size="md"
                  className="text-muted-foreground"
                />
                <span className="min-w-0 flex-1">
                  <span className="font-mono text-sm font-semibold text-foreground">
                    {collection.collection}
                  </span>
                  {title !== collection.collection ? (
                    <span className="font-sans font-normal text-muted-foreground">
                      {" "}
                      · {title}
                    </span>
                  ) : null}
                </span>
                <Badge variant="secondary" className="shrink-0 font-mono">
                  {isFolder
                    ? "folder"
                    : `${fieldCount} field${fieldCount === 1 ? "" : "s"}`}
                </Badge>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <CollectionMeta collection={collection} />
              {fields.length > 0 ? (
                <>
                  <Separator className="my-5" />
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[42rem] table-fixed border-collapse text-left">
                      <colgroup>
                        <col className="w-[22%]" />
                        <col className="w-[14%]" />
                        <col className="w-[22%]" />
                        <col className="w-[42%]" />
                      </colgroup>
                      <thead>
                        <tr className="border-b border-border text-[0.6875rem] font-semibold tracking-wide text-muted-foreground uppercase">
                          <th className="pb-3 pr-4">Field</th>
                          <th className="pb-3 pr-4">Type</th>
                          <th className="pb-3 pr-4">Interface</th>
                          <th className="pb-3">Setup</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fields.map((field) => (
                          <FieldRow key={field.field} field={field} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : null}
              <RelationsList
                collection={collection.collection}
                relations={relations}
              />
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
