<script setup lang="ts">
import { collections, moduleBasePath } from '@/lib/dkit/config'

type SitePage = {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  body?: string | null
  published_at?: string | null
}

const props = withDefaults(defineProps<{ slug: string; basePath?: string }>(), {
  basePath: undefined,
})

const resolvedBase = computed(
  () => props.basePath ?? moduleBasePath('pages', '/pages'),
)

const config = useRuntimeConfig()
const directusUrl = (config.public.directusUrl as string | undefined)?.replace(/\/$/, '')

const { data: page } = await useAsyncData(`dkit-page-${props.slug}`, async () => {
  if (!directusUrl) return null
  try {
    const { createDirectus, rest, readItems } = await import('@directus/sdk')
    const client = createDirectus(directusUrl).with(rest())
    const rows = (await client.request(
      readItems(collections.pages, {
        filter: {
          _and: [{ status: { _eq: 'published' } }, { slug: { _eq: props.slug } }],
        },
        fields: ['id', 'title', 'slug', 'body', 'published_at', 'excerpt'],
        limit: 1,
      }),
    )) as SitePage[]
    return rows[0] ?? null
  } catch {
    return null
  }
})
</script>

<template>
  <div v-if="!page" class="mx-auto max-w-2xl px-6 py-20 text-center text-stone-500">
    <p class="font-serif text-2xl text-stone-800 dark:text-stone-200">Page not found</p>
    <NuxtLink
      :to="resolvedBase"
      class="mt-4 inline-block text-sm text-teal-800 underline-offset-4 hover:underline dark:text-teal-300"
    >
      ← Back
    </NuxtLink>
  </div>

  <article v-else class="mx-auto max-w-2xl px-6 py-16 sm:py-20">
    <header class="border-b border-stone-200 pb-10 dark:border-stone-800">
      <h1 class="font-serif text-4xl leading-[1.15] tracking-tight text-stone-900 sm:text-5xl dark:text-stone-50">
        {{ page.title }}
      </h1>
      <time
        v-if="page.published_at"
        :datetime="page.published_at"
        class="mt-6 block text-sm text-stone-500"
      >
        {{
          new Date(page.published_at).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        }}
      </time>
      <p
        v-if="page.excerpt"
        class="mt-4 text-lg leading-relaxed text-stone-500 dark:text-stone-400"
      >
        {{ page.excerpt }}
      </p>
    </header>

    <div
      v-if="page.body"
      class="mt-10 space-y-4 text-[1.05rem] leading-8 text-stone-700 dark:text-stone-300"
      v-html="page.body"
    />
  </article>
</template>
