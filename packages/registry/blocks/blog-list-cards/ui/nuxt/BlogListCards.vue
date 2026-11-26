<script setup lang="ts">
type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt?: string | null
}

const props = withDefaults(defineProps<{ basePath?: string }>(), {
  basePath: '/blog',
})

const config = useRuntimeConfig()
const { data: posts } = await useAsyncData('dkit-blog-list-cards', async () => {
  const url = config.public.directusUrl as string | undefined
  if (!url) return [] as BlogPost[]
  const { createDirectus, rest, readItems } = await import('@directus/sdk')
  const client = createDirectus(url).with(rest())
  return client.request(
    readItems('posts', {
      filter: { status: { _eq: 'published' } },
      fields: ['id', 'title', 'slug', 'excerpt'],
      sort: ['-published_at'],
    }),
  ) as Promise<BlogPost[]>
})
</script>

<template>
  <div class="mx-auto max-w-5xl py-10">
    <h1 class="text-3xl font-semibold tracking-tight">Blog</h1>
    <div class="mt-8 grid gap-4 sm:grid-cols-2">
      <NuxtLink
        v-for="post in posts || []"
        :key="post.id"
        :to="`${props.basePath}/${post.slug}`"
        class="rounded-xl border border-neutral-200 p-5 transition hover:border-neutral-400 dark:border-neutral-800"
      >
        <h2 class="text-lg font-medium">{{ post.title }}</h2>
        <p v-if="post.excerpt" class="mt-2 line-clamp-3 text-sm text-neutral-500">
          {{ post.excerpt }}
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
