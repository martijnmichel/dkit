<script setup lang="ts">
import { getPage } from '@/lib/dkit/pages'
import { moduleBasePath } from '@/lib/dkit/config'

const props = withDefaults(defineProps<{ slug: string; basePath?: string }>(), {
  basePath: undefined,
})

const resolvedBase = computed(
  () => props.basePath ?? moduleBasePath('pages', '/pages'),
)

const { data: page } = await useAsyncData(`dkit-page-${props.slug}`, () =>
  getPage(props.slug),
)
</script>

<template>
  <div v-if="!page" class="mx-auto max-w-2xl px-6 py-20 text-center text-stone-500">
    <p class="font-serif text-2xl text-stone-800 dark:text-stone-200">Page not found</p>
    <NuxtLink
      :to="resolvedBase === '/' ? '/' : resolvedBase"
      class="mt-4 inline-block text-sm text-teal-800 underline-offset-4 hover:underline dark:text-teal-300"
    >
      ← Back
    </NuxtLink>
  </div>

  <article v-else class="mx-auto max-w-2xl px-6 py-16 sm:py-20">
    <header class="border-b border-stone-200 pb-10 dark:border-stone-800">
      <h1 class="font-serif text-4xl leading-[1.15] tracking-tight text-stone-900 sm:text-5xl dark:text-stone-50">
        {{ page.title }}
      </h1>
      <time
        v-if="page.published_at"
        :datetime="page.published_at"
        class="mt-6 block text-sm text-stone-500"
      >
        {{
          new Date(page.published_at).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        }}
      </time>
      <p
        v-if="page.excerpt"
        class="mt-4 text-lg leading-relaxed text-stone-500 dark:text-stone-400"
      >
        {{ page.excerpt }}
      </p>
    </header>

    <div
      v-if="page.body"
      class="dkit-prose mt-10"
      v-html="page.body"
    />
  </article>
</template>
