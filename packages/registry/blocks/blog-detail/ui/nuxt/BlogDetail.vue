<script setup lang="ts">
import { collections, moduleBasePath } from '@/lib/dkit/config'

type BlogCategory = { id: string; title?: string; slug?: string }
type BlogPost = {
  id: string
  title: string
  slug: string
  body?: string | null
  published_at?: string | null
  author?: { name?: string } | string | null
  categories?: Array<BlogCategory | { categories_id?: BlogCategory | string | null }> | null
}

const props = withDefaults(defineProps<{ slug: string; basePath?: string }>(), {
  basePath: undefined,
})

const resolvedBase = computed(
  () => props.basePath ?? moduleBasePath('blog', '/blog'),
)

const config = useRuntimeConfig()
const { data: post } = await useAsyncData(`dkit-blog-${props.slug}`, async () => {
  const url = config.public.directusUrl as string | undefined
  if (!url) return null
  try {
    const { createDirectus, rest, readItems } = await import('@directus/sdk')
    const client = createDirectus(url).with(rest())
    const rows = (await client.request(
      readItems(collections.posts, {
        filter: {
          _and: [{ status: { _eq: 'published' } }, { slug: { _eq: props.slug } }],
        },
        fields: [
          'id',
          'title',
          'slug',
          'body',
          'published_at',
          { author: ['name'] },
          { categories: ['id', { categories_id: ['id', 'title', 'slug'] }] },
        ],
        limit: 1,
      }),
    )) as BlogPost[]
    return rows[0] ?? null
  } catch {
    return null
  }
})

const author = computed(() =>
  post.value && typeof post.value.author === 'object' && post.value.author?.name
    ? post.value.author.name
    : null,
)

const categories = computed(() => {
  const raw = post.value?.categories ?? []
  const out: BlogCategory[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    if ('title' in item && 'id' in item) {
      out.push(item as BlogCategory)
      continue
    }
    const related = (item as { categories_id?: BlogCategory | string | null }).categories_id
    if (related && typeof related === 'object' && 'id' in related) out.push(related)
  }
  return out
})
</script>

<template>
  <div v-if="!post" class="mx-auto max-w-2xl px-6 py-20 text-center text-stone-500">
    <p class="font-serif text-2xl text-stone-800 dark:text-stone-200">Post not found</p>
    <NuxtLink
      :to="resolvedBase"
      class="mt-4 inline-block text-sm text-teal-800 underline-offset-4 hover:underline dark:text-teal-300"
    >
      ← Back to blog
    </NuxtLink>
  </div>

  <article v-else class="mx-auto max-w-2xl px-6 py-16 sm:py-20">
    <NuxtLink
      :to="resolvedBase"
      class="mb-10 inline-flex items-center gap-2 text-sm text-stone-500 no-underline transition hover:text-teal-800 dark:hover:text-teal-300"
    >
      ← All posts
    </NuxtLink>

    <header class="border-b border-stone-200 pb-10 dark:border-stone-800">
      <div v-if="categories.length" class="mb-4 flex flex-wrap gap-2">
        <span
          v-for="c in categories"
          :key="c.id"
          class="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-900 dark:bg-teal-950 dark:text-teal-200"
        >
          {{ c.title ?? c.slug }}
        </span>
      </div>
      <h1 class="font-serif text-4xl leading-[1.15] tracking-tight text-stone-900 sm:text-5xl dark:text-stone-50">
        {{ post.title }}
      </h1>
      <div class="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-500">
        <span v-if="author" class="font-medium text-stone-700 dark:text-stone-300">{{ author }}</span>
        <span v-if="author && post.published_at" aria-hidden>·</span>
        <time v-if="post.published_at" :datetime="post.published_at">
          {{
            new Date(post.published_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          }}
        </time>
      </div>
    </header>

    <div
      v-if="post.body"
      class="mt-10 space-y-4 text-[1.05rem] leading-8 text-stone-700 dark:text-stone-300"
      v-html="post.body"
    />
  </article>
</template>
