<script setup lang="ts">
import type { PageBlock } from '@/lib/dkit/page-builder'
import { getPageBuilderPageBySlug } from '@/lib/dkit/page-builder'
import { collections } from '@/lib/dkit/config'

/** Minimal kit — semantic HTML + dkit-prose only. */
const props = defineProps<{ slug: string }>()

const { data: page } = await useAsyncData(
  `dkit-page-builder-min-${props.slug}`,
  () => getPageBuilderPageBySlug(props.slug),
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
  <p v-if="!page">Page not found.</p>

  <div v-else>
    <template
      v-for="(block, i) in blocks"
      :key="i"
    >
      <section v-if="block.collection === collections.block_hero">
        <h1>{{ hero(block).heading }}</h1>
        <p v-if="hero(block).subheading">{{ hero(block).subheading }}</p>
      </section>

      <section v-else-if="block.collection === collections.block_richtext">
        <h2 v-if="richtext(block).title">{{ richtext(block).title }}</h2>
        <div
          v-if="richtext(block).content"
          class="dkit-prose"
          v-html="richtext(block).content"
        />
      </section>

      <section v-else-if="block.collection === collections.block_cta">
        <p>
          <a :href="cta(block).href">{{ cta(block).label }}</a>
        </p>
      </section>
    </template>
  </div>
</template>
