import { Command } from "commander";
import * as p from "@clack/prompts";
import pc from "picocolors";
import path from "node:path";
import fs from "node:fs";
import {
  DEFAULT_PROJECT_CONFIG,
  DkitProjectConfigSchema,
  normalizeCollectionPrefix,
  type Framework,
  type UiAdapter,
} from "@dkit/shared";
import { createAuthClient, createTokenClient } from "@dkit/schema";
import { getDirectusCreds, upsertEnvLocal } from "../lib/env.js";
import {
  detectFramework,
  isScaffoldableDir,
} from "../lib/framework.js";
import { scaffoldFrameworkApp } from "../lib/scaffold.js";
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

function cancelIfAny(value: unknown): asserts value is Exclude<typeof value, symbol> {
  if (p.isCancel(value)) {
    p.cancel("Cancelled");
    process.exit(0);
  }
}

export function initCommand(): Command {
  return new Command("init")
    .description(
      "Initialize dkit. Auto-detects Next/Nuxt, or scaffolds a new app if the folder is empty.",
    )
    .option("--url <url>", "Prefill Directus URL")
    .option(
      "--token <token>",
      "Prefill static admin token (skips token prompt with --yes)",
    )
    .option("--framework <name>", "Force framework (next|nuxt); skips detect")
    .option(
      "--ui <adapter>",
      "UI kit: shadcn (Next shadcn/ui · Nuxt shadcn-vue) | minimal",
    )
    .option("--yes", "Non-interactive: require --url and --token (CI)")
    .action(
      async (opts: {
        url?: string;
        token?: string;
        framework?: string;
        ui?: string;
        yes?: boolean;
      }) => {
        p.intro(pc.bgCyan(pc.black(" dkit init ")));

        // Prefer cwd so empty folders don't resolve to a parent monorepo
        let projectRoot = process.cwd();
        const existing = getDirectusCreds(projectRoot);

        // —— Framework: detect, scaffold, or ask ——
        const framework = await resolveFramework(projectRoot, opts);
        // Scaffold may have created package.json in place
        projectRoot = process.cwd();

        const pkgPath = path.join(projectRoot, "package.json");
        if (!fs.existsSync(pkgPath)) {
          p.cancel(
            "No package.json found. Scaffold a Next/Nuxt app first, or run init in a project folder.",
          );
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
            framework,
            uiAdapter: parseUiAdapterFlag(opts.ui) ?? "shadcn",
            collectionPrefix: "dkit_",
          });
          return;
        }

        // —— Interactive wizard ——
        const url = await p.text({
          message: "Directus URL",
          placeholder: "http://localhost:8010",
          initialValue:
            opts.url ?? existing.url ?? "http://localhost:8010",
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
          cancelIfAny(reuse);
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

        const uiFromFlag = parseUiAdapterFlag(opts.ui);
        let uiAdapter: UiAdapter = uiFromFlag ?? "shadcn";
        if (!uiFromFlag) {
          const uiPick = await p.select({
            message: "UI kit (how components bind to your design system)",
            options: [
              {
                value: "shadcn" as const,
                label:
                  framework === "nuxt"
                    ? "shadcn (shadcn-vue components)"
                    : "shadcn (shadcn/ui components)",
                hint: "recommended — auto-installs missing UI components on add",
              },
              {
                value: "minimal" as const,
                label: "Minimal",
                hint: "semantic HTML + dkit-prose only",
              },
            ],
            initialValue: "shadcn" as UiAdapter,
          });
          cancelIf(uiPick);
          uiAdapter = uiPick;
        }

        await finishInit({
          projectRoot,
          url: url.trim(),
          token: finalToken,
          framework,
          uiAdapter,
          collectionPrefix: normalizeCollectionPrefix(prefixAnswer),
        });
      },
    );
}

function parseUiAdapterFlag(raw?: string): UiAdapter | undefined {
  if (!raw) return undefined;
  const v = raw.trim().toLowerCase();
  if (v === "shadcn" || v === "minimal") return v;
  p.cancel(`Unknown --ui "${raw}". Use shadcn or minimal.`);
  process.exit(1);
}

async function resolveFramework(
  projectRoot: string,
  opts: { framework?: string; yes?: boolean },
): Promise<"next" | "nuxt"> {
  const forced = parseFrameworkFlag(opts.framework);
  if (forced) {
    p.log.step(`Framework: ${forced} (--framework)`);
    if (
      isScaffoldableDir(projectRoot) &&
      !fs.existsSync(path.join(projectRoot, "package.json"))
    ) {
      await runScaffold(projectRoot, forced, opts.yes);
    }
    return forced;
  }

  const detected = detectFramework(projectRoot);
  if (detected.framework === "next" || detected.framework === "nuxt") {
    p.log.step(
      `Detected ${detected.framework} (${detected.reasons.join(", ")})`,
    );
    return detected.framework;
  }

  // Empty / scaffoldable folder → ask + create
  if (isScaffoldableDir(projectRoot)) {
    if (opts.yes) {
      p.cancel(
        "Empty project: pass --framework next|nuxt with --yes to scaffold, or create the app first.",
      );
      process.exit(1);
    }

    p.log.info("No Next.js or Nuxt app detected — this folder looks empty.");
    const pick = await p.select({
      message: "Create a new project with which framework?",
      options: [
        { value: "next", label: "Next.js (create-next-app defaults)" },
        { value: "nuxt", label: "Nuxt 3 (nuxi init defaults)" },
      ],
      initialValue: "next" as "next" | "nuxt",
    });
    cancelIf(pick);
    await runScaffold(projectRoot, pick, false);
    return pick;
  }

  // Existing non-empty project without clear framework
  if (opts.yes) {
    p.log.warn("Could not detect framework — defaulting to next. Pass --framework to override.");
    return "next";
  }

  const pick = await p.select({
    message: "Which frontend framework? (could not auto-detect)",
    options: [
      { value: "next", label: "Next.js (App Router)" },
      { value: "nuxt", label: "Nuxt 3" },
    ],
    initialValue: "next" as "next" | "nuxt",
  });
  cancelIf(pick);
  return pick;
}

async function runScaffold(
  projectRoot: string,
  framework: "next" | "nuxt",
  quiet?: boolean,
): Promise<void> {
  if (!quiet) {
    p.log.step(
      framework === "next"
        ? "Running create-next-app with defaults…"
        : "Running nuxi init with defaults…",
    );
  }
  const result = scaffoldFrameworkApp(projectRoot, framework);
  if (!result.ok) {
    p.cancel(result.error ?? "Scaffold failed");
    process.exit(1);
  }
  p.log.success(
    framework === "next" ? "Next.js project created" : "Nuxt project created",
  );
}

function parseFrameworkFlag(value?: string): "next" | "nuxt" | null {
  if (!value) return null;
  if (value === "next" || value === "nuxt") return value;
  p.cancel(`Unknown framework "${value}". Use next or nuxt.`);
  process.exit(1);
}

async function finishInit(args: {
  projectRoot: string;
  url: string;
  token: string;
  framework: Framework;
  uiAdapter: UiAdapter;
  collectionPrefix: string;
}): Promise<void> {
  if (args.framework !== "next" && args.framework !== "nuxt") {
    p.cancel(`Framework "${args.framework}" is not supported yet.`);
    process.exit(1);
  }

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
    uiAdapter: args.uiAdapter,
    collectionPrefix: args.collectionPrefix,
    aliases:
      args.framework === "nuxt"
        ? { components: "@/components/dkit", lib: "@/lib/dkit" }
        : DEFAULT_PROJECT_CONFIG.aliases,
  });
  writeProjectConfig(args.projectRoot, config);
  const clientFile = writeClientHelper(args.projectRoot, config);

  const uiHint =
    args.uiAdapter === "shadcn"
      ? args.framework === "nuxt"
        ? "UI kit shadcn: dkit add will auto-install missing shadcn-vue components."
        : "UI kit shadcn: dkit add will auto-install missing shadcn/ui components."
      : "Minimal kit: semantic HTML + dkit-prose (blocks fall back if they only ship shadcn).";

  p.note(
    [
      `Framework: ${args.framework}`,
      `UI kit:    ${args.uiAdapter}`,
      `Prefix:    ${args.collectionPrefix || "(none)"}`,
      `Config:    ${path.join(args.projectRoot, "dkit.json")}`,
      `Env:       ${path.join(args.projectRoot, ".env.local")}`,
      `Client:    ${clientFile}`,
      "",
      uiHint,
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
