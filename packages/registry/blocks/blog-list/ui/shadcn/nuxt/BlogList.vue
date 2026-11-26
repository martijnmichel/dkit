<script setup lang="ts">
import {
  authorAvatarUrl,
  authorName,
  featuredImageUrl,
  getBlogPosts,
} from '@/lib/dkit/blog'
import { joinModulePath, moduleBasePath } from '@/lib/dkit/config'

/** Styled with shadcn-vue theme tokens — inherits your app theme. */
const props = withDefaults(defineProps<{ basePath?: string }>(), {
  basePath: undefined,
})

const resolvedBase = computed(
  () => props.basePath ?? moduleBasePath('blog', '/blog'),
)

const { data: posts } = await useAsyncData('dkit-blog-list', () => getBlogPosts())
</script>

<template>
  <div class="relative mx-auto max-w-2xl px-6 py-16 sm:py-20">
    <header class="mb-12 border-b border-border pb-10">
      <p class="mb-3 text-xs font-medium tracking-[0.2em] text-primary uppercase">
        Journal
      </p>
      <h1 class="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
        Blog
      </h1>
      <p class="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
        Newest posts first.
      </p>
    </header>

    <p
      v-if="!(posts && posts.length)"
      class="rounded-xl border border-dashed border-border bg-muted/40 px-6 py-10 text-center text-muted-foreground"
    >
      No posts yet.
    </p>

    <ul v-else class="space-y-1">
      <li v-for="(post, i) in posts" :key="post.id">
        <NuxtLink
          :to="joinModulePath(resolvedBase, post.slug)"
          class="group flex gap-5 rounded-xl px-4 py-5 transition-colors hover:bg-muted/60"
        >
          <img
            v-if="featuredImageUrl(post)"
            :src="featuredImageUrl(post)!"
            alt=""
            class="mt-0.5 h-16 w-16 shrink-0 rounded-lg object-cover ring-1 ring-border"
          />
          <span
            v-else
            class="mt-1 w-8 shrink-0 font-mono text-xs text-muted-foreground tabular-nums"
          >
            {{ String(i + 1).padStart(2, '0') }}
          </span>
          <span class="min-w-0 flex-1">
            <span class="block text-xl font-medium tracking-tight text-foreground transition-colors group-hover:text-primary">
              {{ post.title }}
            </span>
            <span
              v-if="post.excerpt"
              class="mt-2 block text-sm leading-relaxed text-muted-foreground"
            >
              {{ post.excerpt }}
            </span>
            <span class="mt-3 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
              <span v-if="authorName(post)" class="inline-flex items-center gap-1.5">
                <img
                  v-if="authorAvatarUrl(post)"
                  :src="authorAvatarUrl(post)!"
                  alt=""
                  class="h-5 w-5 rounded-full object-cover ring-1 ring-border"
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
              <span class="ml-auto text-primary opacity-0 transition group-hover:opacity-100">
                Read →
              </span>
            </span>
          </span>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
