<script setup lang="ts">
import {
  authorAvatarUrl,
  authorName,
  featuredImageUrl,
  getBlogPostBySlug,
  normalizeCategories,
} from '@/lib/dkit/blog'
import { moduleBasePath } from '@/lib/dkit/config'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

/** Uses your project's shadcn-vue components. */
const props = withDefaults(defineProps<{ slug: string; basePath?: string }>(), {
  basePath: undefined,
})

const resolvedBase = computed(
  () => props.basePath ?? moduleBasePath('blog', '/blog'),
)

const { data: post } = await useAsyncData(`dkit-blog-${props.slug}`, () =>
  getBlogPostBySlug(props.slug),
)

const categories = computed(() =>
  post.value ? normalizeCategories(post.value.categories) : [],
)
</script>

<template>
  <div
    v-if="!post"
    class="mx-auto max-w-2xl px-6 py-20 text-center text-muted-foreground"
  >
    <p class="text-2xl font-semibold text-foreground">Post not found</p>
    <Button
      as-child
      variant="link"
      class="mt-4"
    >
      <NuxtLink :to="resolvedBase">← Back to blog</NuxtLink>
    </Button>
  </div>

  <article
    v-else
    class="mx-auto max-w-2xl px-6 py-16 sm:py-20"
  >
    <Button
      as-child
      variant="ghost"
      class="mb-10 px-0"
    >
      <NuxtLink :to="resolvedBase">← All posts</NuxtLink>
    </Button>

    <img
      v-if="featuredImageUrl(post)"
      :src="featuredImageUrl(post)!"
      alt=""
      class="mb-10 aspect-[16/9] w-full rounded-xl object-cover ring-1 ring-border"
    />

    <header class="border-b border-border pb-10">
      <div
        v-if="categories.length"
        class="mb-4 flex flex-wrap gap-2"
      >
        <Badge
          v-for="c in categories"
          :key="c.id"
          variant="secondary"
        >
          {{ c.title ?? c.slug }}
        </Badge>
      </div>
      <h1 class="text-4xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-5xl">
        {{ post.title }}
      </h1>
      <div class="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <span
          v-if="authorName(post)"
          class="inline-flex items-center gap-2 font-medium text-foreground"
        >
          <img
            v-if="authorAvatarUrl(post)"
            :src="authorAvatarUrl(post)!"
            alt=""
            class="h-7 w-7 rounded-full object-cover ring-1 ring-border"
          />
          {{ authorName(post) }}
        </span>
        <span v-if="authorName(post) && post.published_at" aria-hidden>·</span>
        <time
          v-if="post.published_at"
          :datetime="post.published_at"
        >
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
      class="dkit-prose mt-10"
      v-html="post.body"
    />
  </article>
</template>
