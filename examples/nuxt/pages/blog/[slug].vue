<script setup lang="ts">
import { Detail, installed } from "@/components/dkit/blog";

const route = useRoute();
const slug = computed(() => String(route.params.slug ?? ""));
</script>

<template>
  <p v-if="!installed">
    Run <code>dkit add blog</code> to install UI.
  </p>
  <Detail v-else :slug="slug" />
</template>
