<script setup lang="ts">
import { getPosts } from '@/lib/dkit/blog'
import { joinModulePath, moduleBasePath } from '@/lib/dkit/config'

/** Minimal kit — semantic HTML card list (no theme tokens). */
const props = withDefaults(defineProps<{ basePath?: string }>(), {
  basePath: undefined,
})

const resolvedBase = computed(
  () => props.basePath ?? moduleBasePath('blog', '/blog'),
)

const { data: posts } = await useAsyncData('dkit-blog-list-cards-min', () =>
  getPosts(),
)
</script>

<template>
  <section>
    <header>
      <h1>Blog</h1>
      <p>Browse posts.</p>
    </header>

    <p v-if="!(posts && posts.length)">No published posts yet.</p>

    <div v-else>
      <article v-for="post in posts" :key="post.id">
        <h2>
          <NuxtLink :to="joinModulePath(resolvedBase, post.slug)">
            {{ post.title }}
          </NuxtLink>
        </h2>
        <p v-if="post.published_at">
          <time :datetime="post.published_at">
            {{ new Date(post.published_at).toLocaleDateString() }}
          </time>
        </p>
        <p v-if="post.excerpt">{{ post.excerpt }}</p>
      </article>
    </div>
  </section>
</template>
