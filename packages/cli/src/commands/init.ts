import { Command } from "commander";
import * as p from "@clack/prompts";
import pc from "picocolors";
import path from "node:path";
import fs from "node:fs";
import {
  DEFAULT_PROJECT_CONFIG,
  DkitProjectConfigSchema,
  normalizeCollectionPrefix,
} from "@dkit/shared";
import { createAuthClient, createTokenClient } from "@dkit/schema";
import { findProjectRoot } from "../lib/paths.js";
import { getDirectusCreds, upsertEnvLocal } from "../lib/env.js";
import {
  ensurePackageDependency,
  writeClientHelper,
  writeProjectConfig,
} from "../lib/write-files.js";

function cancelIf(value: unknown): asserts value is string {
  if (p.isCancel(value)) {
    p.cancel("Cancelled");
    process.exit(0);
  }
}

export function initCommand(): Command {
  return new Command("init")
    .description("Initialize dkit (interactive). Flags only prefill answers.")
    .option("--url <url>", "Prefill Directus URL")
    .option("--token <token>", "Prefill static admin token (skips token prompt with --yes)")
    .option("--framework <name>", "Prefill framework (next|nuxt)")
    .option("--yes", "Non-interactive: require --url and --token (CI)")
    .action(
      async (opts: {
        url?: string;
        token?: string;
        framework?: string;
        yes?: boolean;
      }) => {
        p.intro(pc.bgCyan(pc.black(" dkit init ")));
        const projectRoot = findProjectRoot();
        const existing = getDirectusCreds(projectRoot);

        const pkgPath = path.join(projectRoot, "package.json");
        if (!fs.existsSync(pkgPath)) {
          p.cancel("No package.json found. Run inside a Next.js or Nuxt project.");
          process.exit(1);
        }

        const hasSdk = ensurePackageDependency(projectRoot, "@directus/sdk");
        if (!hasSdk) {
          p.log.warn(
            "Install @directus/sdk: pnpm add @directus/sdk (or npm i @directus/sdk)",
          );
        }

        // —— Non-interactive CI path ——
        if (opts.yes) {
          const url = opts.url ?? existing.url;
          const token = opts.token ?? existing.token;
          if (!url || !token) {
            p.cancel("Non-interactive init needs --url and --token (or env).");
            process.exit(1);
          }
          await finishInit({
            projectRoot,
            url,
            token,
            framework: opts.framework === "nuxt" ? "nuxt" : "next",
            collectionPrefix: "dkit_",
          });
          return;
        }

        // —— Interactive wizard (always ask; flags/env are defaults) ——
        const frameworkPick = await p.select({
          message: "Which frontend framework?",
          options: [
            { value: "next", label: "Next.js (App Router)" },
            { value: "nuxt", label: "Nuxt 3" },
          ],
          initialValue:
            opts.framework === "nuxt"
              ? "nuxt"
              : ("next" as "next" | "nuxt"),
        });
        cancelIf(frameworkPick);

        const url = await p.text({
          message: "Directus URL",
          placeholder: "http://localhost:8055",
          initialValue:
            opts.url ?? existing.url ?? "http://localhost:8055",
          validate: (v) => (!v?.trim() ? "URL is required" : undefined),
        });
        cancelIf(url);

        const method = await p.select({
          message: "How do you want to authenticate for installs?",
          options: [
            {
              value: "token",
              label: "Static admin token",
              hint: "recommended",
            },
            {
              value: "password",
              label: "Email + password",
              hint: "then paste a static token",
            },
          ],
          initialValue: "token",
        });
        cancelIf(method);

        if (method === "password") {
          const email = await p.text({
            message: "Admin email",
            initialValue: "admin@example.com",
            validate: (v) => (!v?.trim() ? "Required" : undefined),
          });
          cancelIf(email);
          const password = await p.password({
            message: "Admin password",
            validate: (v) => (!v ? "Required" : undefined),
          });
          cancelIf(password);

          const spin = p.spinner();
          spin.start("Logging in…");
          try {
            const client = createAuthClient(url.trim());
            await (
              client as { login: (e: string, pw: string) => Promise<unknown> }
            ).login(email.trim(), password);
            spin.stop("Login OK");
            p.log.info(
              "Create a static token in Directus (User → Token) and paste it next — needed for CI and re-runs.",
            );
          } catch (e) {
            spin.stop("Login failed");
            p.cancel(e instanceof Error ? e.message : String(e));
            process.exit(1);
          }
        }

        let finalToken: string | undefined;
        const knownToken = opts.token ?? existing.token;
        if (knownToken) {
          const reuse = await p.confirm({
            message: opts.token
              ? "Use the token from --token?"
              : "Use existing DIRECTUS_TOKEN from env / .env.local?",
            initialValue: true,
          });
          if (p.isCancel(reuse)) {
            p.cancel("Cancelled");
            process.exit(0);
          }
          if (reuse) finalToken = knownToken;
        }
        if (!finalToken) {
          const token = await p.password({
            message: "Static admin token",
            validate: (v) => (!v ? "Token is required" : undefined),
          });
          cancelIf(token);
          finalToken = token;
        }

        const prefixAnswer = await p.text({
          message: "Default collection name prefix",
          placeholder: "dkit_",
          initialValue: "dkit_",
          validate: (v) => {
            if (v === undefined) return "Required (use empty for none)";
            return undefined;
          },
        });
        cancelIf(prefixAnswer);

        await finishInit({
          projectRoot,
          url: url.trim(),
          token: finalToken,
          framework: frameworkPick,
          collectionPrefix: normalizeCollectionPrefix(prefixAnswer),
        });
      },
    );
}

async function finishInit(args: {
  projectRoot: string;
  url: string;
  token: string;
  framework: "next" | "nuxt";
  collectionPrefix: string;
}): Promise<void> {
  const spin = p.spinner();
  spin.start("Checking Directus credentials…");
  const client = createTokenClient(args.url, args.token);
  try {
    await client.request(() => ({
      path: "/users/me",
      method: "GET",
      params: { fields: ["id", "email"] },
    }));
    spin.stop("Authenticated");
  } catch (e) {
    spin.stop("Auth failed");
    p.cancel(
      `Could not authenticate against ${args.url}.\n${e instanceof Error ? e.message : e}`,
    );
    process.exit(1);
  }

  upsertEnvLocal(args.projectRoot, {
    DIRECTUS_URL: args.url,
    DIRECTUS_TOKEN: args.token,
  });

  const config = DkitProjectConfigSchema.parse({
    ...DEFAULT_PROJECT_CONFIG,
    framework: args.framework,
    collectionPrefix: args.collectionPrefix,
    aliases:
      args.framework === "nuxt"
        ? { components: "@/components/dkit", lib: "@/lib/dkit" }
        : DEFAULT_PROJECT_CONFIG.aliases,
  });
  writeProjectConfig(args.projectRoot, config);
  const clientFile = writeClientHelper(args.projectRoot, config);

  p.note(
    [
      `Framework: ${args.framework}`,
      `Prefix:    ${args.collectionPrefix || "(none)"}`,
      `Config:    ${path.join(args.projectRoot, "dkit.json")}`,
      `Env:       ${path.join(args.projectRoot, ".env.local")}`,
      `Client:    ${clientFile}`,
      "",
      "Next:  dkit add blog --seed",
      "Tips:  dkit list · dkit doctor",
      "Note:  add always asks for route base path when the module needs one.",
      "Warn:  back up Directus (or use staging) before applying modules.",
    ].join("\n"),
    "Initialized",
  );
  p.outro(pc.green("Done"));
}
