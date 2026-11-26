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
  alias: {
    "@": ".",
  },
  components: [
    { path: "~/components/dkit", pathPrefix: false, extensions: ["vue"] },
  ],
});
