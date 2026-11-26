<script setup lang="ts">
import { collections } from '@/lib/dkit/config'

type SitePage = {
  id: string
  title: string
  body?: string | null
  published_at?: string | null
}

const props = defineProps<{ slug: string }>()
const config = useRuntimeConfig()
const directusUrl = (config.public.directusUrl as string | undefined)?.replace(/\/$/, '')

const { data: page } = await useAsyncData(`dkit-page-min-${props.slug}`, async () => {
  if (!directusUrl) return null
  const { createDirectus, rest, readItems } = await import('@directus/sdk')
  const client = createDirectus(directusUrl).with(rest())
  const rows = (await client.request(
    readItems(collections.pages, {
      filter: {
        _and: [{ status: { _eq: 'published' } }, { slug: { _eq: props.slug } }],
      },
      fields: ['id', 'title', 'body', 'published_at'],
      limit: 1,
    }),
  )) as SitePage[]
  return rows[0] ?? null
})
</script>

<template>
  <p v-if="!page">Page not found.</p>
  <article v-else>
    <h1>{{ page.title }}</h1>
    <p v-if="page.published_at">
      <time :datetime="page.published_at">
        {{ new Date(page.published_at).toLocaleDateString() }}
      </time>
    </p>
    <div v-if="page.body" v-html="page.body" />
  </article>
</template>
