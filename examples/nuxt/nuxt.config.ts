export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      directusUrl: process.env.DIRECTUS_URL || "http://localhost:8010",
    },
  },
  alias: {
    "@": ".",
  },
  components: [
    { path: "~/components/dkit", pathPrefix: false, extensions: ["vue"] },
  ],
});
