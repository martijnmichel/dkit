<template>
  <main class="page">
    <p class="badge">Nuxt 3 · port 3002</p>
    <h1>dkit / nuxt</h1>
    <p class="muted">
      Install blog UI with the Nuxt adapter, then open
      <NuxtLink to="/blog">/blog</NuxtLink>.
    </p>

    <pre class="code">{{ help }}</pre>

    <div class="actions">
      <NuxtLink class="btn" to="/blog">Open blog</NuxtLink>
    </div>
  </main>
</template>

<script setup lang="ts">
const help = `# from monorepo root
pnpm directus:up
export DIRECTUS_TOKEN=<static-admin-token>

pnpm example:nuxt:setup
pnpm example:nuxt:dev

pnpm example:nuxt:clear     # remove components/dkit + lib/dkit
pnpm example:nuxt:reset     # clear + re-add blog

# card + minimal templates
pnpm --filter @dkit/example-nuxt dkit:add-blog-cards`
</script>

<style scoped>
.page {
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 24px;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
}
.badge {
  display: inline-block;
  border: 1px solid #e5e5e5;
  border-radius: 999px;
  padding: 2px 10px;
  font-size: 12px;
  color: #666;
}
h1 {
  font-size: 32px;
  letter-spacing: -0.03em;
  margin: 16px 0 0;
}
.muted {
  color: #666;
  margin-top: 12px;
}
.code {
  margin-top: 24px;
  padding: 16px;
  background: #111;
  color: #f5f5f5;
  border-radius: 8px;
  overflow: auto;
  font-size: 13px;
  line-height: 1.45;
}
.actions {
  margin-top: 24px;
}
.btn {
  display: inline-block;
  background: #111;
  color: #fff;
  text-decoration: none;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 14px;
}
a {
  color: inherit;
}
</style>
