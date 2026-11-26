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
      class="mt-10 space-y-4 text-[1.05rem] leading-8 text-stone-700 [&_a]:text-teal-800 [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-l-2 [&_blockquote]:border-teal-700/40 [&_blockquote]:pl-4 [&_blockquote]:text-stone-500 [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:tracking-tight [&_h2]:text-stone-900 [&_h3]:mt-8 [&_h3]:font-serif [&_h3]:text-xl [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-4 dark:text-stone-300 dark:[&_a]:text-teal-300 dark:[&_h2]:text-stone-50"
      v-html="page.body"
    />
  </article>
</template>
