<script setup lang="ts">
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const listPath = join(process.cwd(), 'components/dkit/blog-list/BlogList.vue')
const cardsPath = join(process.cwd(), 'components/dkit/blog-list-cards/BlogListCards.vue')

const hasList = import.meta.server ? existsSync(listPath) : false
const hasCards = import.meta.server ? existsSync(cardsPath) : false
</script>

<template>
  <BlogList v-if="hasList" />
  <BlogListCards v-else-if="hasCards" />
  <main v-else class="hint">
    <h1>Blog UI not installed yet</h1>
    <p>
      From the monorepo root:
      <code>pnpm example:nuxt:setup</code>
    </p>
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
code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.9em;
}
</style>
