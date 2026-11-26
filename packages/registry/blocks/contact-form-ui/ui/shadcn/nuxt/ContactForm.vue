<script setup lang="ts">
import {
  createContactSubmission,
  type ContactFormState,
} from '@/lib/dkit/contact-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

/** Uses your project's shadcn-vue components. */
const state = ref<ContactFormState>({ ok: false })
const pending = ref(false)
const name = ref('')
const email = ref('')
const message = ref('')

async function onSubmit(event: Event) {
  event.preventDefault()
  pending.value = true
  state.value = { ok: false }
  try {
    const result = await createContactSubmission({
      name: name.value,
      email: email.value,
      message: message.value,
    })
    state.value = result.ok
      ? { ok: true }
      : { ok: false, error: result.error }
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div
    v-if="state.ok"
    class="rounded-lg border border-border bg-muted/40 p-6 text-foreground"
  >
    Thanks — we received your message.
  </div>

  <form
    v-else
    class="max-w-md space-y-4"
    @submit="onSubmit"
  >
    <p class="text-sm text-muted-foreground">
      Send a message and we'll get back to you.
    </p>
    <div class="space-y-2">
      <Label for="name">Name</Label>
      <Input
        id="name"
        v-model="name"
        required
      />
    </div>
    <div class="space-y-2">
      <Label for="email">Email</Label>
      <Input
        id="email"
        v-model="email"
        type="email"
        required
      />
    </div>
    <div class="space-y-2">
      <Label for="message">Message</Label>
      <Textarea
        id="message"
        v-model="message"
        required
        :rows="5"
      />
    </div>
    <p
      v-if="state.error"
      class="text-sm text-destructive"
    >
      {{ state.error }}
    </p>
    <Button
      type="submit"
      :disabled="pending"
    >
      {{ pending ? 'Sending…' : 'Send' }}
    </Button>
  </form>
</template>
