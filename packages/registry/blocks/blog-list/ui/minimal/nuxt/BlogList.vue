<script setup lang="ts">
import {
  authorAvatarUrl,
  authorName,
  featuredImageUrl,
  getBlogPosts,
} from '@/lib/dkit/blog'
import { joinModulePath, moduleBasePath } from '@/lib/dkit/config'

/** Minimal kit — semantic HTML only (browser-default controls / images). */
const props = withDefaults(defineProps<{ basePath?: string }>(), {
  basePath: undefined,
})

const resolvedBase = computed(
  () => props.basePath ?? moduleBasePath('blog', '/blog'),
)

const { data: posts } = await useAsyncData('dkit-blog-list-min', () => getBlogPosts())
</script>

<template>
  <section>
    <header>
      <h1>Blog</h1>
    </header>

    <p v-if="!(posts && posts.length)">No published posts yet.</p>

    <ul v-else>
      <li v-for="post in posts" :key="post.id">
        <img
          v-if="featuredImageUrl(post)"
          :src="featuredImageUrl(post)!"
          alt=""
          width="120"
          height="120"
        />
        <NuxtLink :to="joinModulePath(resolvedBase, post.slug)">
          {{ post.title }}
        </NuxtLink>
        <template v-if="post.published_at">
          {{ ' ' }}
          <time :datetime="post.published_at">
            {{ new Date(post.published_at).toLocaleDateString() }}
          </time>
        </template>
        <p v-if="authorName(post)">
          <img
            v-if="authorAvatarUrl(post)"
            :src="authorAvatarUrl(post)!"
            alt=""
            width="24"
            height="24"
          />
          {{ authorName(post) }}
        </p>
        <p v-if="post.excerpt">{{ post.excerpt }}</p>
      </li>
    </ul>
  </section>
</template>
