import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    public: {
      directusUrl: process.env.DIRECTUS_URL || "http://localhost:8010",
    },
  },
  // Do not override `@` — Nuxt’s defaults map `@`/`~` to the project root.
  // `alias: { "@": "." }` breaks that (tsconfig resolves `@` into `.nuxt/`),
  // so shadcn-vue writes UI into the build dir instead of `components/ui`.
  components: [
    { path: "~/components/dkit", pathPrefix: false, extensions: ["vue"] },
  ],
});
