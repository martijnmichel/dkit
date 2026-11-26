<script setup lang="ts">
type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  published_at?: string | null
  author?: { name?: string } | string | null
}

const props = withDefaults(defineProps<{ basePath?: string }>(), {
  basePath: '/blog',
})

const config = useRuntimeConfig()
const { data: posts } = await useAsyncData('dkit-blog-list', async () => {
  const url = config.public.directusUrl as string | undefined
  if (!url) return [] as BlogPost[]
  const { createDirectus, rest, readItems } = await import('@directus/sdk')
  const client = createDirectus(url).with(rest())
  return client.request(
    readItems('posts', {
      filter: { status: { _eq: 'published' } },
      fields: ['id', 'title', 'slug', 'excerpt', 'published_at', { author: ['name'] }],
      sort: ['-published_at'],
    }),
  ) as Promise<BlogPost[]>
})
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-8 py-10">
    <header>
      <h1 class="text-3xl font-semibold tracking-tight">Blog</h1>
      <p class="mt-2 text-neutral-500">Published posts from Directus.</p>
    </header>
    <ul class="space-y-6">
      <li
        v-for="post in posts || []"
        :key="post.id"
        class="border-b border-neutral-200 pb-6 dark:border-neutral-800"
      >
        <NuxtLink :to="`${props.basePath}/${post.slug}`" class="group block">
          <h2 class="text-xl font-medium group-hover:underline">{{ post.title }}</h2>
          <p v-if="post.excerpt" class="mt-2 text-neutral-600 dark:text-neutral-400">
            {{ post.excerpt }}
          </p>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
