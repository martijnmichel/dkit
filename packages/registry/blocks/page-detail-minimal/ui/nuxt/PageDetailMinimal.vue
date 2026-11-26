<script setup lang="ts">
import { getPage } from '@/lib/dkit/pages'

const props = defineProps<{ slug: string }>()

const { data: page } = await useAsyncData(`dkit-page-min-${props.slug}`, () =>
  getPage(props.slug),
)
</script>

<template>
  <p v-if="!page">Page not found.</p>
  <article v-else>
    <h1>{{ page.title }}</h1>
    <p v-if="page.published_at">
      <time :datetime="page.published_at">
        {{ new Date(page.published_at).toLocaleDateString() }}
      </time>
    </p>
    <div v-if="page.body" v-html="page.body" />
  </article>
</template>
