import { createDirectus, readItems, rest } from "@directus/sdk";
import type { Release } from "@/lib/dkit/changelog";

async function getReleases(): Promise<Release[]> {
  const url = process.env.DIRECTUS_URL;
  if (!url) return [];
  const client = createDirectus(url).with(rest());
  return client.request(
    readItems("releases", {
      fields: ["*"],
      sort: ["-released_at"],
    }),
  ) as Promise<Release[]>;
}

const badge: Record<string, string> = {
  shipped: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  in_progress: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100",
  planned: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
};

export async function ChangelogTimeline() {
  const releases = await getReleases();

  return (
    <div className="mx-auto max-w-2xl py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Changelog</h1>
      <ol className="mt-10 space-y-8 border-l border-neutral-200 pl-6 dark:border-neutral-800">
        {releases.map((r) => (
          <li key={r.id} className="relative">
            <span className="absolute -left-[1.6rem] top-1.5 h-2.5 w-2.5 rounded-full bg-neutral-400" />
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm text-neutral-500">{r.version}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge[r.status] ?? badge.planned}`}
              >
                {r.status.replace("_", " ")}
              </span>
              {(r.tags ?? []).map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-neutral-200 px-2 py-0.5 text-xs dark:border-neutral-700"
                >
                  {t}
                </span>
              ))}
            </div>
            <h2 className="mt-2 text-lg font-medium">{r.title}</h2>
            {r.body ? (
              <div
                className="prose prose-sm prose-neutral dark:prose-invert mt-2"
                dangerouslySetInnerHTML={{ __html: r.body }}
              />
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
