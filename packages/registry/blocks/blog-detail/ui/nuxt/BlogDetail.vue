<script setup lang="ts">
import {
  authorAvatarUrl,
  authorName,
  featuredImageUrl,
  getPost,
  normalizeCategories,
} from '@/lib/dkit/blog'
import { moduleBasePath } from '@/lib/dkit/config'

const props = withDefaults(defineProps<{ slug: string; basePath?: string }>(), {
  basePath: undefined,
})

const resolvedBase = computed(
  () => props.basePath ?? moduleBasePath('blog', '/blog'),
)

const { data: post } = await useAsyncData(`dkit-blog-${props.slug}`, () =>
  getPost(props.slug),
)

const categories = computed(() =>
  post.value ? normalizeCategories(post.value.categories) : [],
)
</script>

<template>
  <div
    v-if="!post"
    class="mx-auto max-w-2xl px-6 py-20 text-center text-stone-500"
  >
    <p class="font-serif text-2xl text-stone-800 dark:text-stone-200">
      Post not found
    </p>
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

    <img
      v-if="featuredImageUrl(post)"
      :src="featuredImageUrl(post)!"
      alt=""
      class="mb-10 aspect-[16/9] w-full rounded-3xl object-cover ring-1 ring-stone-200 dark:ring-stone-800"
    />

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
        <span
          v-if="authorName(post)"
          class="inline-flex items-center gap-2 font-medium text-stone-700 dark:text-stone-300"
        >
          <img
            v-if="authorAvatarUrl(post)"
            :src="authorAvatarUrl(post)!"
            alt=""
            class="h-7 w-7 rounded-full object-cover ring-1 ring-stone-200 dark:ring-stone-700"
          />
          {{ authorName(post) }}
        </span>
        <span v-if="authorName(post) && post.published_at" aria-hidden>·</span>
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
      class="mt-10 space-y-4 text-[1.05rem] leading-8 text-stone-700 [&_a]:text-teal-800 [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-l-2 [&_blockquote]:border-teal-700/40 [&_blockquote]:pl-4 [&_blockquote]:text-stone-500 [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:tracking-tight [&_h2]:text-stone-900 [&_h3]:mt-8 [&_h3]:font-serif [&_h3]:text-xl [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-4 dark:text-stone-300 dark:[&_a]:text-teal-300 dark:[&_h2]:text-stone-50"
      v-html="post.body"
    />
  </article>
</template>
