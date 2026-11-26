<script setup lang="ts">
import type { PageBlock } from '@/lib/dkit/page-builder'
import { getPageBuilderPageBySlug } from '@/lib/dkit/page-builder'
import { collections } from '@/lib/dkit/config'
import { Button } from '@/components/ui/button'

/** Uses your project's shadcn-vue components. */
const props = defineProps<{ slug: string }>()

const { data: page } = await useAsyncData(`dkit-page-builder-${props.slug}`, () =>
  getPageBuilderPageBySlug(props.slug),
)

const blocks = computed(() => (page.value?.blocks ?? []) as PageBlock[])

function hero(block: PageBlock) {
  return block.item as { heading?: string; subheading?: string }
}

function richtext(block: PageBlock) {
  return block.item as { title?: string; content?: string }
}

function cta(block: PageBlock) {
  return block.item as { href?: string; label?: string }
}
</script>

<template>
  <div
    v-if="!page"
    class="py-10 text-center text-muted-foreground"
  >
    Page not found.
  </div>

  <div v-else>
    <template
      v-for="(block, i) in blocks"
      :key="i"
    >
      <section
        v-if="block.collection === collections.block_hero"
        class="space-y-3 py-12 text-center"
      >
        <h1 class="text-4xl font-semibold tracking-tight text-foreground">
          {{ hero(block).heading }}
        </h1>
        <p
          v-if="hero(block).subheading"
          class="text-lg text-muted-foreground"
        >
          {{ hero(block).subheading }}
        </p>
      </section>

      <section
        v-else-if="block.collection === collections.block_richtext"
        class="mx-auto max-w-2xl py-8"
      >
        <h2
          v-if="richtext(block).title"
          class="mb-4 text-2xl font-medium text-foreground"
        >
          {{ richtext(block).title }}
        </h2>
        <div
          v-if="richtext(block).content"
          class="dkit-prose"
          v-html="richtext(block).content"
        />
      </section>

      <section
        v-else-if="block.collection === collections.block_cta"
        class="flex justify-center py-8"
      >
        <Button as-child>
          <a :href="cta(block).href">{{ cta(block).label }}</a>
        </Button>
      </section>
    </template>
  </div>
</template>
