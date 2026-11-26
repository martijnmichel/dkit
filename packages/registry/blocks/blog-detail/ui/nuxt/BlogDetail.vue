<script setup lang="ts">
import { collections } from '@/lib/dkit/config'

type BlogPost = {
  id: string
  title: string
  slug: string
  body?: string | null
  published_at?: string | null
  author?: { name?: string } | string | null
}

const props = defineProps<{ slug: string }>()
const config = useRuntimeConfig()

const { data: post } = await useAsyncData(`dkit-blog-${props.slug}`, async () => {
  const url = config.public.directusUrl as string | undefined
  if (!url) return null
  const { createDirectus, rest, readItems } = await import('@directus/sdk')
  const client = createDirectus(url).with(rest())
  const rows = (await client.request(
    readItems(collections.posts, {
      filter: {
        _and: [{ status: { _eq: 'published' } }, { slug: { _eq: props.slug } }],
      },
      fields: ['id', 'title', 'slug', 'body', 'published_at', { author: ['name'] }],
      limit: 1,
    }),
  )) as BlogPost[]
  return rows[0] ?? null
})
</script>

<template>
  <div v-if="!post" class="mx-auto max-w-2xl py-10 text-neutral-500">Post not found.</div>
  <article v-else class="mx-auto max-w-2xl space-y-6 py-10">
    <header class="space-y-2">
      <h1 class="text-4xl font-semibold tracking-tight">{{ post.title }}</h1>
      <p class="text-sm text-neutral-500">
        <span v-if="typeof post.author === 'object' && post.author?.name">{{ post.author.name }}</span>
        <span v-if="post.published_at"> · {{ new Date(post.published_at).toLocaleDateString() }}</span>
      </p>
    </header>
    <div
      v-if="post.body"
      class="prose prose-neutral dark:prose-invert max-w-none"
      v-html="post.body"
    />
  </article>
</template>
