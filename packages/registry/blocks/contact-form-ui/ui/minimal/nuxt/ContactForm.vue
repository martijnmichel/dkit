<script setup lang="ts">
import {
  createContactSubmission,
  type ContactFormState,
} from '@/lib/dkit/contact-form'

/** Minimal kit — semantic form markup only. */
const state = ref<ContactFormState>({ ok: false })
const pending = ref(false)

async function onSubmit(event: Event) {
  event.preventDefault()
  const form = event.target as HTMLFormElement
  const data = new FormData(form)
  pending.value = true
  state.value = { ok: false }
  try {
    const result = await createContactSubmission({
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      message: String(data.get('message') ?? ''),
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
  <p v-if="state.ok">Thanks — we received your message.</p>

  <form
    v-else
    @submit="onSubmit"
  >
    <p>Send a message and we'll get back to you.</p>
    <p>
      <label for="name">Name</label>
      <br />
      <input
        id="name"
        name="name"
        required
      />
    </p>
    <p>
      <label for="email">Email</label>
      <br />
      <input
        id="email"
        name="email"
        type="email"
        required
      />
    </p>
    <p>
      <label for="message">Message</label>
      <br />
      <textarea
        id="message"
        name="message"
        required
        rows="5"
      />
    </p>
    <p v-if="state.error">{{ state.error }}</p>
    <p>
      <button
        type="submit"
        :disabled="pending"
      >
        {{ pending ? 'Sending…' : 'Send' }}
      </button>
    </p>
  </form>
</template>
