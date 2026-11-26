<template>
  <main style="max-width:720px;margin:0 auto;padding:48px 24px">
    <h1 style="font-size:32px;margin:0">Nuxt example</h1>
    <p style="color:#666;margin-top:12px">
      Vue adapter playground for dkit blog templates.
    </p>
    <pre style="margin-top:24px;padding:16px;background:#111;color:#f5f5f5;border-radius:8px;overflow:auto;font-size:13px">{{ help }}</pre>
    <p style="margin-top:24px"><NuxtLink to="/blog">Open /blog</NuxtLink></p>
  </main>
</template>

<script setup lang="ts">
const help = `# from repo root
pnpm directus:up
export DIRECTUS_TOKEN=<static-admin-token>

pnpm example:nuxt:setup
pnpm --filter @dkit/example-nuxt dev

pnpm example:nuxt:clear
pnpm example:nuxt:reset`
</script>
