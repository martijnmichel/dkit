<script setup lang="ts">
import {
  authorAvatarUrl,
  authorName,
  featuredImageUrl,
  getPosts,
} from '@/lib/dkit/blog'
import { joinModulePath, moduleBasePath } from '@/lib/dkit/config'

const props = withDefaults(defineProps<{ basePath?: string }>(), {
  basePath: undefined,
})

const resolvedBase = computed(
  () => props.basePath ?? moduleBasePath('blog', '/blog'),
)

const { data: posts } = await useAsyncData('dkit-blog-list-cards', () => getPosts())
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-16 sm:py-20">
    <header class="mb-12 max-w-xl">
      <p class="mb-3 text-xs font-semibold tracking-[0.2em] text-teal-800 uppercase dark:text-teal-300">
        Journal
      </p>
      <h1 class="font-serif text-4xl tracking-tight text-stone-900 sm:text-5xl dark:text-stone-50">
        Blog
      </h1>
      <p class="mt-4 text-stone-500 dark:text-stone-400">
        Browse posts in a card grid.
      </p>
    </header>

    <p
      v-if="!(posts && posts.length)"
      class="rounded-2xl border border-dashed border-stone-300 px-6 py-12 text-center text-stone-500 dark:border-stone-700"
    >
      No published posts yet.
    </p>

    <div v-else class="grid gap-5 sm:grid-cols-2">
      <NuxtLink
        v-for="post in posts"
        :key="post.id"
        :to="joinModulePath(resolvedBase, post.slug)"
        class="group relative flex flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-[0_1px_0_rgba(28,25,23,0.04)] transition hover:-translate-y-0.5 hover:border-teal-700/30 hover:shadow-md dark:border-stone-800 dark:bg-stone-950"
      >
        <img
          v-if="featuredImageUrl(post)"
          :src="featuredImageUrl(post)!"
          alt=""
          class="aspect-[16/9] w-full object-cover"
        />
        <div
          v-else
          class="aspect-[16/9] w-full bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-900 dark:to-stone-800"
        />
        <div class="flex flex-1 flex-col p-6">
          <div class="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-teal-700 transition group-hover:scale-x-100" />
          <time
            v-if="post.published_at"
            :datetime="post.published_at"
            class="text-xs font-medium tracking-wide text-stone-400 uppercase"
          >
            {{
              new Date(post.published_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            }}
          </time>
          <h2 class="mt-3 font-serif text-2xl tracking-tight text-stone-900 transition group-hover:text-teal-800 dark:text-stone-50 dark:group-hover:text-teal-300">
            {{ post.title }}
          </h2>
          <p
            v-if="post.excerpt"
            class="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-stone-500 dark:text-stone-400"
          >
            {{ post.excerpt }}
          </p>
          <span v-else class="flex-1" />
          <div class="mt-6 flex items-center justify-between gap-3">
            <span
              v-if="authorName(post)"
              class="inline-flex items-center gap-2 text-xs text-stone-500"
            >
              <img
                v-if="authorAvatarUrl(post)"
                :src="authorAvatarUrl(post)!"
                alt=""
                class="h-6 w-6 rounded-full object-cover ring-1 ring-stone-200 dark:ring-stone-700"
              />
              {{ authorName(post) }}
            </span>
            <span v-else />
            <span class="text-sm font-medium text-teal-800 dark:text-teal-300">
              Read article →
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
