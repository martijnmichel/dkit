<script setup lang="ts">
import { getPage } from '@/lib/dkit/pages'
import { moduleBasePath } from '@/lib/dkit/config'

/** Styled with shadcn-vue theme tokens — inherits your app theme. */
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
  <div v-if="!page" class="mx-auto max-w-2xl px-6 py-20 text-center text-muted-foreground">
    <p class="text-2xl font-semibold text-foreground">Page not found</p>
    <NuxtLink
      :to="resolvedBase === '/' ? '/' : resolvedBase"
      class="mt-4 inline-block text-sm text-primary underline-offset-4 hover:underline"
    >
      ← Back
    </NuxtLink>
  </div>

  <article v-else class="mx-auto max-w-2xl px-6 py-16 sm:py-20">
    <header class="border-b border-border pb-10">
      <h1 class="text-4xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-5xl">
        {{ page.title }}
      </h1>
      <time
        v-if="page.published_at"
        :datetime="page.published_at"
        class="mt-6 block text-sm text-muted-foreground"
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
        class="mt-4 text-lg leading-relaxed text-muted-foreground"
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
