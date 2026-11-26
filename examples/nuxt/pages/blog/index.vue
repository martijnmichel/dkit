<script setup lang="ts">
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const listPath = join(process.cwd(), 'components/dkit/blog-list/BlogList.vue')
const cardsPath = join(process.cwd(), 'components/dkit/blog-list-cards/BlogListCards.vue')
const hasList = existsSync(listPath)
const hasCards = existsSync(cardsPath)
</script>

<template>
  <div v-if="hasList">
    <BlogList />
  </div>
  <div v-else-if="hasCards">
    <BlogListCards />
  </div>
  <main v-else style="max-width:640px;margin:48px auto;padding:24px">
    <h1>Blog UI not installed yet</h1>
    <p style="color:#666">Run <code>pnpm example:nuxt:setup</code> from the monorepo root.</p>
  </main>
</template>
