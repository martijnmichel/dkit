<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const model = defineModel<string | number>()

const props = defineProps<{
  class?: HTMLAttributes["class"]
  id?: string
  required?: boolean
  disabled?: boolean
  rows?: number | string
  placeholder?: string
}>()
</script>

<template>
  <textarea
    :id="id"
    v-model="model"
    :required="required"
    :disabled="disabled"
    :rows="rows"
    :placeholder="placeholder"
    :class="
      cn(
        'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
  />
</template>
