<script setup lang="ts">
/**
 * Sandpack preview stand-in for shadcn-vue Button.
 * Apps get the real component via `shadcn-vue add button`.
 */
import { cloneVNode, useSlots, type HTMLAttributes } from "vue"
import type { ButtonVariants } from "./buttonVariants"
import { cn } from "@/lib/utils"
import { buttonVariants } from "./buttonVariants"

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariants["variant"]
    size?: ButtonVariants["size"]
    class?: HTMLAttributes["class"]
    asChild?: boolean
    type?: "button" | "submit" | "reset"
    disabled?: boolean
  }>(),
  {
    asChild: false,
    type: "button",
  },
)

const slots = useSlots()

function childWithClass() {
  const nodes = slots.default?.()
  const vnode = nodes?.[0]
  if (!vnode) return null
  return cloneVNode(vnode, {
    class: cn(
      buttonVariants({ variant: props.variant, size: props.size }),
      props.class,
      (vnode.props as { class?: string } | null)?.class,
    ),
  })
}
</script>

<template>
  <template v-if="asChild">
    <component :is="childWithClass()" />
  </template>
  <button
    v-else
    :type="type"
    :disabled="disabled"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <slot />
  </button>
</template>
