<script setup lang="ts">
import { collections, moduleBasePath } from '@/lib/dkit/config'

type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  published_at?: string | null
  author?: { name?: string } | string | null
}

const props = withDefaults(defineProps<{ basePath?: string }>(), {
  basePath: undefined,
})

const resolvedBase = computed(
  () => props.basePath ?? moduleBasePath('blog', '/blog'),
)

const config = useRuntimeConfig()
const { data: posts } = await useAsyncData('dkit-blog-list', async () => {
  const url = config.public.directusUrl as string | undefined
  if (!url) return [] as BlogPost[]
  try {
    const { createDirectus, rest, readItems } = await import('@directus/sdk')
    const client = createDirectus(url).with(rest())
    return (await client.request(
      readItems(collections.posts, {
        filter: { status: { _eq: 'published' } },
        fields: ['id', 'title', 'slug', 'excerpt', 'published_at', { author: ['name'] }],
        sort: ['-published_at'],
      }),
    )) as BlogPost[]
  } catch {
    return [] as BlogPost[]
  }
})

function authorName(post: BlogPost) {
  return typeof post.author === 'object' && post.author?.name ? post.author.name : null
}
</script>

<template>
  <div class="relative mx-auto max-w-2xl px-6 py-16 sm:py-20">
    <header class="mb-12 border-b border-stone-200 pb-10 dark:border-stone-800">
      <p class="mb-3 text-xs font-semibold tracking-[0.2em] text-teal-800 uppercase dark:text-teal-300">
        Journal
      </p>
      <h1 class="font-serif text-4xl leading-tight tracking-tight text-stone-900 sm:text-5xl dark:text-stone-50">
        Blog
      </h1>
      <p class="mt-4 max-w-md text-base leading-relaxed text-stone-500 dark:text-stone-400">
        Stories and notes from Directus — newest first.
      </p>
    </header>

    <p
      v-if="!(posts && posts.length)"
      class="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-6 py-10 text-center text-stone-500 dark:border-stone-700 dark:bg-stone-900/40 dark:text-stone-400"
    >
      No published posts yet. Add one in Directus and refresh.
    </p>

    <ul v-else class="space-y-2">
      <li v-for="(post, i) in posts" :key="post.id">
        <NuxtLink
          :to="`${resolvedBase}/${post.slug}`"
          class="group flex gap-5 rounded-2xl px-4 py-5 transition hover:bg-stone-100/80 dark:hover:bg-stone-900/60"
        >
          <span class="mt-1 w-8 shrink-0 font-mono text-xs text-stone-400 tabular-nums">
            {{ String(i + 1).padStart(2, '0') }}
          </span>
          <span class="min-w-0 flex-1">
            <span class="block font-serif text-xl tracking-tight text-stone-900 transition group-hover:text-teal-800 dark:text-stone-50 dark:group-hover:text-teal-300">
              {{ post.title }}
            </span>
            <span
              v-if="post.excerpt"
              class="mt-2 block text-sm leading-relaxed text-stone-500 dark:text-stone-400"
            >
              {{ post.excerpt }}
            </span>
            <span class="mt-3 flex flex-wrap items-center gap-x-2 text-xs text-stone-400">
              <span v-if="authorName(post)">{{ authorName(post) }}</span>
              <span v-if="authorName(post) && post.published_at" aria-hidden>·</span>
              <time v-if="post.published_at" :datetime="post.published_at">
                {{
                  new Date(post.published_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                }}
              </time>
              <span class="ml-auto text-teal-800 opacity-0 transition group-hover:opacity-100 dark:text-teal-300">
                Read →
              </span>
            </span>
          </span>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
