import { Command } from "commander";
import * as p from "@clack/prompts";
import pc from "picocolors";
import path from "node:path";
import fs from "node:fs";
import {
  DEFAULT_PROJECT_CONFIG,
  DkitProjectConfigSchema,
} from "@dkit/shared";
import { createAuthClient, createTokenClient } from "@dkit/schema";
import { findProjectRoot } from "../lib/paths.js";
import { upsertEnvLocal } from "../lib/env.js";
import {
  ensurePackageDependency,
  writeClientHelper,
  writeProjectConfig,
} from "../lib/write-files.js";

export function initCommand(): Command {
  return new Command("init")
    .description("Initialize dkit in this Next.js project")
    .option("--url <url>", "Directus URL")
    .option("--token <token>", "Directus static admin token")
    .action(async (opts: { url?: string; token?: string }) => {
      p.intro(pc.bgCyan(pc.black(" dkit init ")));
      const projectRoot = findProjectRoot();

      const pkgPath = path.join(projectRoot, "package.json");
      if (!fs.existsSync(pkgPath)) {
        p.cancel("No package.json found. Run inside a Next.js project.");
        process.exit(1);
      }

      const hasSdk = ensurePackageDependency(projectRoot, "@directus/sdk");
      if (!hasSdk) {
        p.log.warn(
          "Install @directus/sdk first: pnpm add @directus/sdk (or npm/yarn).",
        );
      }

      const url =
        opts.url ??
        ((await p.text({
          message: "Directus URL",
          placeholder: "http://localhost:8055",
          defaultValue: "http://localhost:8055",
          validate: (v) => (!v ? "Required" : undefined),
        })) as string);

      if (p.isCancel(url)) {
        p.cancel("Cancelled");
        process.exit(0);
      }

      let token = opts.token;

      if (!token) {
        const method = await p.select({
          message: "How do you want to authenticate for installs?",
          options: [
            { value: "token", label: "Static admin token (recommended)" },
            { value: "password", label: "Email + password (then paste a static token)" },
          ],
        });

        if (p.isCancel(method)) {
          p.cancel("Cancelled");
          process.exit(0);
        }

        if (method === "password") {
          const email = (await p.text({
            message: "Admin email",
            validate: (v) => (!v ? "Required" : undefined),
          })) as string;
          if (p.isCancel(email)) process.exit(0);
          const password = (await p.password({
            message: "Admin password",
            validate: (v) => (!v ? "Required" : undefined),
          })) as string;
          if (p.isCancel(password)) process.exit(0);

          try {
            const client = createAuthClient(url);
            // @directus/sdk authentication login
            await (client as { login: (e: string, p: string) => Promise<unknown> }).login(
              email,
              password,
            );
            p.log.success("Login OK. Create a static token in Directus (User → Token) and paste it below for .env.local.");
          } catch (e) {
            p.cancel(
              `Login failed: ${e instanceof Error ? e.message : e}`,
            );
            process.exit(1);
          }
        }

        token = (await p.text({
          message: "Static admin token",
          validate: (v) => (!v ? "Required" : undefined),
        })) as string;
        if (p.isCancel(token)) {
          p.cancel("Cancelled");
          process.exit(0);
        }
      }

      const client = createTokenClient(url, token);
      try {
        await client.request(() => ({
          path: "/users/me",
          method: "GET",
          params: { fields: ["id", "email"] },
        }));
      } catch (e) {
        p.cancel(
          `Could not authenticate against ${url}. Check URL and token.\n${e instanceof Error ? e.message : e}`,
        );
        process.exit(1);
      }

      upsertEnvLocal(projectRoot, {
        DIRECTUS_URL: url,
        DIRECTUS_TOKEN: token,
      });

      const config = DkitProjectConfigSchema.parse({
        ...DEFAULT_PROJECT_CONFIG,
        framework: "next",
      });
      writeProjectConfig(projectRoot, config);
      const clientFile = writeClientHelper(projectRoot, config);

      p.note(
        [
          `Config: ${path.join(projectRoot, "dkit.json")}`,
          `Env:    ${path.join(projectRoot, ".env.local")}`,
          `Client: ${clientFile}`,
          "",
          "Next: dkit add blog --seed",
          "Warn: back up Directus (or use staging) before applying modules.",
        ].join("\n"),
        "Initialized",
      );
      p.outro(pc.green("Done"));
    });
}
