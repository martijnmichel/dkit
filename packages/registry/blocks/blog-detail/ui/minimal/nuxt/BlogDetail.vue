<script setup lang="ts">
import { featuredImageUrl, getBlogPostBySlug } from '@/lib/dkit/blog'

const props = defineProps<{ slug: string }>()

const { data: post } = await useAsyncData(`dkit-blog-min-${props.slug}`, () =>
  getBlogPostBySlug(props.slug),
)
</script>

<template>
  <p v-if="!post">Post not found.</p>
  <article v-else>
    <img v-if="featuredImageUrl(post)" :src="featuredImageUrl(post)!" alt="" />
    <h1>{{ post.title }}</h1>
    <p v-if="post.published_at">
      <time :datetime="post.published_at">
        {{ new Date(post.published_at).toLocaleDateString() }}
      </time>
    </p>
    <div
      v-if="post.body"
      class="dkit-prose dkit-prose--compact"
      v-html="post.body"
    />
  </article>
</template>
