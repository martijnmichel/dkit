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

const { data: posts } = await useAsyncData('dkit-blog-list', () => getPosts())
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
          :to="joinModulePath(resolvedBase, post.slug)"
          class="group flex gap-5 rounded-2xl px-4 py-5 transition hover:bg-stone-100/80 dark:hover:bg-stone-900/60"
        >
          <img
            v-if="featuredImageUrl(post)"
            :src="featuredImageUrl(post)!"
            alt=""
            class="mt-0.5 h-16 w-16 shrink-0 rounded-xl object-cover ring-1 ring-stone-200 dark:ring-stone-700"
          />
          <span
            v-else
            class="mt-1 w-8 shrink-0 font-mono text-xs text-stone-400 tabular-nums"
          >
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
              <span v-if="authorName(post)" class="inline-flex items-center gap-1.5">
                <img
                  v-if="authorAvatarUrl(post)"
                  :src="authorAvatarUrl(post)!"
                  alt=""
                  class="h-5 w-5 rounded-full object-cover ring-1 ring-stone-200 dark:ring-stone-700"
                />
                <span>{{ authorName(post) }}</span>
              </span>
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
