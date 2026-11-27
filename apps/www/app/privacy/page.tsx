import { DocsPage, DocsSection } from "@/components/docs-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy — dkit",
  description:
    "How dkit.run and the dkit CLI handle analytics and telemetry.",
};

export default function PrivacyPage() {
  return (
    <DocsPage
      title="Privacy"
      description="What dkit collects on the website and in the CLI, and how to opt out."
      toc={[
        { id: "summary", label: "Summary" },
        { id: "website", label: "Website" },
        { id: "cli", label: "CLI" },
        { id: "opt-out", label: "Opt out" },
        { id: "storage", label: "Storage" },
        { id: "contact", label: "Contact" },
      ]}
    >
      <DocsSection id="summary" title="Summary">
        <p>
          dkit is open source (MIT). We do not require an account. We use
          privacy-oriented analytics to understand which docs and CLI commands
          are used — not to track you across the web or read your projects.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            We do <strong>not</strong> collect Directus tokens, file paths,
            source code, or project contents.
          </li>
          <li>
            Analytics run on{" "}
            <code className="font-mono">analytics.kurbo.dev</code> (Umami).
          </li>
          <li>You can turn CLI telemetry off at any time.</li>
        </ul>
      </DocsSection>

      <DocsSection id="website" title="Website (dkit.run)">
        <p>
          In production, the site loads a Umami script for pageviews (path,
          referrer, browser language, and similar standard analytics fields).
          This helps us see which docs are useful.
        </p>
        <p>
          Local development does not load analytics. We do not sell site data or
          use advertising trackers.
        </p>
      </DocsSection>

      <DocsSection id="cli" title="CLI (@kurbo/dkit)">
        <p>
          By default the CLI sends anonymous usage events (command name, flags,
          and CLI version) to the same Umami host. Events are labeled under a
          synthetic hostname for the CLI — not your machine name.
        </p>
        <p>
          Telemetry never includes tokens, URLs you pass for Directus, local
          paths, or file contents. Failed network sends are ignored so analytics
          cannot break installs.
        </p>
      </DocsSection>

      <DocsSection id="opt-out" title="Opt out">
        <p>Disable CLI telemetry with any of:</p>
        <pre className="code">{`DKIT_TELEMETRY=0
DO_NOT_TRACK=1
dkit --no-telemetry …`}</pre>
        <p>
          For the website, use your browser’s usual tracking / content blockers,
          or browse with scripts disabled. We do not set a separate marketing
          cookie banner because we only use first-party analytics for product
          usage.
        </p>
      </DocsSection>

      <DocsSection id="storage" title="Storage and processors">
        <p>
          Analytics are processed by Umami on infrastructure operated for Kurbo
          (<code className="font-mono">analytics.kurbo.dev</code>). We keep data
          only as long as it is useful for improving dkit, then delete or
          aggregate it.
        </p>
        <p>
          Your installed modules and Directus data stay in{" "}
          <strong>your</strong> repos and Directus instance — dkit does not host
          customer project data.
        </p>
      </DocsSection>

      <DocsSection id="contact" title="Contact">
        <p>
          Questions about this policy:{" "}
          <a href="https://kurbo.dev" rel="noopener noreferrer">
            kurbo.dev
          </a>{" "}
          or open an issue on{" "}
          <a
            href="https://github.com/martijnmichel/dkit"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          . We may update this page as the product changes; the date below
          reflects the latest revision.
        </p>
        <p className="text-sm text-muted-foreground">
          Last updated: 27 November 2026
        </p>
      </DocsSection>
    </DocsPage>
  );
}
