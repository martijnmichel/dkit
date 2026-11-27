<script setup lang="ts">
import {
  authorAvatarUrl,
  authorName,
  featuredImageUrl,
  getBlogPosts,
} from '@/lib/dkit/blog'
import { joinModulePath, moduleBasePath } from '@/lib/dkit/config'

/** Minimal kit — plain HTML card grid (no Tailwind / shadcn). */
const props = withDefaults(defineProps<{ basePath?: string }>(), {
  basePath: undefined,
})

const resolvedBase = computed(
  () => props.basePath ?? moduleBasePath('blog', '/blog'),
)

const { data: posts } = await useAsyncData('dkit-blog-list-cards-min', () =>
  getBlogPosts(),
)
</script>

<template>
  <section>
    <style>
      .dkit-blog-cards {
        display: grid;
        gap: 1.25rem;
        grid-template-columns: 1fr;
      }
      @media (min-width: 640px) {
        .dkit-blog-cards {
          grid-template-columns: 1fr 1fr;
        }
      }
      .dkit-blog-cards article {
        border: 1px solid #ccc;
        padding: 0;
        overflow: hidden;
      }
      .dkit-blog-cards article > a {
        display: block;
        color: inherit;
        text-decoration: none;
      }
      .dkit-blog-cards .dkit-blog-cards__media {
        display: block;
        width: 100%;
        aspect-ratio: 16 / 9;
        object-fit: cover;
        background: #eee;
        border: 0;
      }
      .dkit-blog-cards .dkit-blog-cards__body {
        padding: 0.75rem 1rem 1rem;
      }
      .dkit-blog-cards .dkit-blog-cards__meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.5rem;
        margin: 0.75rem 0 0;
        font-size: 0.875rem;
      }
      .dkit-blog-cards .dkit-blog-cards__avatar {
        width: 1.5rem;
        height: 1.5rem;
        border-radius: 9999px;
        object-fit: cover;
        vertical-align: middle;
      }
    </style>

    <header>
      <h1>Blog</h1>
      <p>Browse posts.</p>
    </header>

    <p v-if="!(posts && posts.length)">No published posts yet.</p>

    <div v-else class="dkit-blog-cards">
      <article v-for="post in posts" :key="post.id">
        <NuxtLink :to="joinModulePath(resolvedBase, post.slug)">
          <img
            v-if="featuredImageUrl(post)"
            class="dkit-blog-cards__media"
            :src="featuredImageUrl(post)!"
            alt=""
          />
          <span v-else class="dkit-blog-cards__media" aria-hidden="true" />
          <div class="dkit-blog-cards__body">
            <p v-if="post.published_at">
              <time :datetime="post.published_at">
                {{ new Date(post.published_at).toLocaleDateString() }}
              </time>
            </p>
            <h2>{{ post.title }}</h2>
            <p v-if="post.excerpt">{{ post.excerpt }}</p>
            <p v-if="authorName(post)" class="dkit-blog-cards__meta">
              <img
                v-if="authorAvatarUrl(post)"
                class="dkit-blog-cards__avatar"
                :src="authorAvatarUrl(post)!"
                alt=""
              />
              <span>{{ authorName(post) }}</span>
            </p>
          </div>
        </NuxtLink>
      </article>
    </div>
  </section>
</template>
