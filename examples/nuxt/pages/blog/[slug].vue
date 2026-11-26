<script setup lang="ts">
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const route = useRoute()
const slug = route.params.slug as string
const full = join(process.cwd(), 'components/dkit/blog-detail/BlogDetail.vue')
const minimal = join(process.cwd(), 'components/dkit/blog-detail-minimal/BlogDetailMinimal.vue')
const hasFull = existsSync(full)
const hasMinimal = existsSync(minimal)
</script>

<template>
  <BlogDetail v-if="hasFull" :slug="slug" />
  <BlogDetailMinimal v-else-if="hasMinimal" :slug="slug" />
  <main v-else style="max-width:640px;margin:48px auto;padding:24px">
    <h1>Blog detail UI not installed yet</h1>
    <p style="color:#666">Run <code>pnpm example:nuxt:setup</code>.</p>
  </main>
</template>
