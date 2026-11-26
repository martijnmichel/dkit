import { z } from "zod";

export const DkitProjectConfigSchema = z.object({
  $schema: z.string().optional(),
  framework: z.enum(["next", "nuxt"]).default("next"),
  aliases: z
    .object({
      components: z.string().default("@/components/dkit"),
      lib: z.string().default("@/lib/dkit"),
    })
    .default({}),
  registry: z.string().url().optional(),
  tailwind: z.boolean().default(true),
});

export type DkitProjectConfig = z.infer<typeof DkitProjectConfigSchema>;

export const DEFAULT_PROJECT_CONFIG: DkitProjectConfig = {
  framework: "next",
  aliases: {
    components: "@/components/dkit",
    lib: "@/lib/dkit",
  },
  tailwind: true,
};
