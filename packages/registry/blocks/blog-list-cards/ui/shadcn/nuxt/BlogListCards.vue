<script setup lang="ts">
import {
  authorAvatarUrl,
  authorName,
  featuredImageUrl,
  getBlogPosts,
} from '@/lib/dkit/blog'
import { joinModulePath, moduleBasePath } from '@/lib/dkit/config'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

/** Uses your project's shadcn-vue components. */
const props = withDefaults(defineProps<{ basePath?: string }>(), {
  basePath: undefined,
})

const resolvedBase = computed(
  () => props.basePath ?? moduleBasePath('blog', '/blog'),
)

const { data: posts } = await useAsyncData('dkit-blog-list-cards', () => getBlogPosts())
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-16 sm:py-20">
    <header class="mb-12 max-w-xl">
      <p class="mb-3 text-xs font-medium tracking-[0.2em] text-primary uppercase">
        Journal
      </p>
      <h1 class="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        Blog
      </h1>
      <p class="mt-4 text-muted-foreground">Browse posts in a card grid.</p>
    </header>

    <p
      v-if="!(posts && posts.length)"
      class="rounded-xl border border-dashed border-border px-6 py-12 text-center text-muted-foreground"
    >
      No posts yet.
    </p>

    <div
      v-else
      class="grid gap-5 sm:grid-cols-2"
    >
      <NuxtLink
        v-for="post in posts"
        :key="post.id"
        :to="joinModulePath(resolvedBase, post.slug)"
        class="group block no-underline transition hover:-translate-y-0.5"
      >
        <Card class="h-full overflow-hidden pt-0 pb-6 shadow-sm transition group-hover:border-primary/40 group-hover:shadow-md">
          <img
            v-if="featuredImageUrl(post)"
            :src="featuredImageUrl(post)!"
            alt=""
            class="aspect-[16/9] w-full object-cover"
          />
          <div
            v-else
            class="aspect-[16/9] w-full bg-muted"
          />
          <CardHeader>
            <CardDescription v-if="post.published_at">
              <time :datetime="post.published_at">
                {{
                  new Date(post.published_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                }}
              </time>
            </CardDescription>
            <CardTitle class="text-2xl transition-colors group-hover:text-primary">
              {{ post.title }}
            </CardTitle>
          </CardHeader>
          <CardContent v-if="post.excerpt">
            <p class="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {{ post.excerpt }}
            </p>
          </CardContent>
          <CardFooter class="justify-between gap-3">
            <span
              v-if="authorName(post)"
              class="inline-flex items-center gap-2 text-xs text-muted-foreground"
            >
              <img
                v-if="authorAvatarUrl(post)"
                :src="authorAvatarUrl(post)!"
                alt=""
                class="h-6 w-6 rounded-full object-cover ring-1 ring-border"
              />
              {{ authorName(post) }}
            </span>
            <span v-else />
            <span class="text-sm font-medium text-primary">
              Read article →
            </span>
          </CardFooter>
        </Card>
      </NuxtLink>
    </div>
  </div>
</template>
