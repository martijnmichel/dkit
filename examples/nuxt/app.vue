<template>
  <div class="shell">
    <header class="top">
      <NuxtLink to="/" class="brand">dkit / nuxt</NuxtLink>
      <NuxtLink to="/blog" class="nav">Blog</NuxtLink>
    </header>
    <NuxtPage />
  </div>
</template>

<style>
html,
body {
  margin: 0;
  background: #fafafa;
  color: #111;
}
.shell {
  min-height: 100vh;
}
.top {
  border-bottom: 1px solid #e5e5e5;
  padding: 12px 24px;
  display: flex;
  gap: 16px;
  align-items: center;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
}
.brand {
  font-weight: 600;
  text-decoration: none;
  color: inherit;
}
.nav {
  color: #666;
  text-decoration: none;
}
.nav:hover {
  color: #111;
}
</style>
