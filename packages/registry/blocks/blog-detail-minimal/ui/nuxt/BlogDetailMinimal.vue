<script setup lang="ts">
import { collections } from '@/lib/dkit/config'

/**
 * Unstyled / bare markup — no design system classes.
 */
type BlogPost = {
  id: string
  title: string
  body?: string | null
  published_at?: string | null
}

const props = defineProps<{ slug: string }>()
const config = useRuntimeConfig()

const { data: post } = await useAsyncData(`dkit-blog-min-${props.slug}`, async () => {
  const url = config.public.directusUrl as string | undefined
  if (!url) return null
  const { createDirectus, rest, readItems } = await import('@directus/sdk')
  const client = createDirectus(url).with(rest())
  const rows = (await client.request(
    readItems(collections.posts, {
      filter: {
        _and: [{ status: { _eq: 'published' } }, { slug: { _eq: props.slug } }],
      },
      fields: ['id', 'title', 'body', 'published_at'],
      limit: 1,
    }),
  )) as BlogPost[]
  return rows[0] ?? null
})
</script>

<template>
  <p v-if="!post">Post not found.</p>
  <article v-else>
    <h1>{{ post.title }}</h1>
    <p v-if="post.published_at">
      <time :datetime="post.published_at">
        {{ new Date(post.published_at).toLocaleDateString() }}
      </time>
    </p>
    <div v-if="post.body" v-html="post.body" />
  </article>
</template>
