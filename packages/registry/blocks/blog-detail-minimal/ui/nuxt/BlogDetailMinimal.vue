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
  featured_image?: string | { id: string } | null
}

const props = defineProps<{ slug: string }>()
const config = useRuntimeConfig()
const directusUrl = (config.public.directusUrl as string | undefined)?.replace(/\/$/, '')

const { data: post } = await useAsyncData(`dkit-blog-min-${props.slug}`, async () => {
  if (!directusUrl) return null
  const { createDirectus, rest, readItems } = await import('@directus/sdk')
  const client = createDirectus(directusUrl).with(rest())
  const rows = (await client.request(
    readItems(collections.posts, {
      filter: {
        _and: [{ status: { _eq: 'published' } }, { slug: { _eq: props.slug } }],
      },
      fields: ['id', 'title', 'body', 'published_at', 'featured_image'],
      limit: 1,
    }),
  )) as BlogPost[]
  return rows[0] ?? null
})

const imageUrl = computed(() => {
  const value = post.value?.featured_image
  if (!value || !directusUrl) return null
  const id = typeof value === 'string' ? value : value.id
  return id ? `${directusUrl}/assets/${id}` : null
})
</script>

<template>
  <p v-if="!post">Post not found.</p>
  <article v-else>
    <img v-if="imageUrl" :src="imageUrl" alt="" />
    <h1>{{ post.title }}</h1>
    <p v-if="post.published_at">
      <time :datetime="post.published_at">
        {{ new Date(post.published_at).toLocaleDateString() }}
      </time>
    </p>
    <div v-if="post.body" v-html="post.body" />
  </article>
</template>
