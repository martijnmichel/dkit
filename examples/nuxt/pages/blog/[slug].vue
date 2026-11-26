<script setup lang="ts">
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const route = useRoute()
const slug = computed(() => String(route.params.slug))

const full = join(process.cwd(), 'components/dkit/blog/BlogDetail.vue')
const minimal = join(
  process.cwd(),
  'components/dkit/blog/BlogDetailMinimal.vue',
)

const hasFull = import.meta.server ? existsSync(full) : false
const hasMinimal = import.meta.server ? existsSync(minimal) : false
</script>

<template>
  <BlogDetail v-if="hasFull" :slug="slug" />
  <BlogDetailMinimal v-else-if="hasMinimal" :slug="slug" />
  <main v-else class="hint">
    <h1>Blog detail UI not installed yet</h1>
    <p>Run <code>pnpm example:nuxt:setup</code> from the monorepo root.</p>
  </main>
</template>

<style scoped>
.hint {
  max-width: 640px;
  margin: 48px auto;
  padding: 24px;
  font-family: ui-sans-serif, system-ui, sans-serif;
}
.hint p {
  color: #666;
}
</style>
