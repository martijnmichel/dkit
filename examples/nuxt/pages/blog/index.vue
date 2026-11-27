<script setup lang="ts">
import { List, installed } from "@/components/dkit/blog";
</script>

<template>
  <main class="container py-16">
    <p v-if="!installed">
      Run <code>pnpm example:nuxt:setup</code> from the monorepo root.
    </p>
    <List v-else />
  </main>
</template>
