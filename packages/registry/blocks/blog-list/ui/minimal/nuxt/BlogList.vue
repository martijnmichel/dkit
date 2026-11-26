<script setup lang="ts">
import { getPosts } from '@/lib/dkit/blog'
import { joinModulePath, moduleBasePath } from '@/lib/dkit/config'

/** Minimal kit — semantic HTML only. */
const props = withDefaults(defineProps<{ basePath?: string }>(), {
  basePath: undefined,
})

const resolvedBase = computed(
  () => props.basePath ?? moduleBasePath('blog', '/blog'),
)

const { data: posts } = await useAsyncData('dkit-blog-list-min', () => getPosts())
</script>

<template>
  <section>
    <header>
      <h1>Blog</h1>
    </header>

    <p v-if="!(posts && posts.length)">No published posts yet.</p>

    <ul v-else>
      <li v-for="post in posts" :key="post.id">
        <NuxtLink :to="joinModulePath(resolvedBase, post.slug)">
          {{ post.title }}
        </NuxtLink>
        <template v-if="post.published_at">
          {{ ' ' }}
          <time :datetime="post.published_at">
            {{ new Date(post.published_at).toLocaleDateString() }}
          </time>
        </template>
        <p v-if="post.excerpt">{{ post.excerpt }}</p>
      </li>
    </ul>
  </section>
</template>
