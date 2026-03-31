<script setup lang="ts">
const { data: feed, status } = useFetch('/api/nasa-feed', {
  lazy: true,
  server: false
})

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}
</script>

<template>
  <div class="nasa-feed">
    <div class="nasa-feed-header">
      <UIcon
        name="i-lucide-rss"
        class="h-3 w-3 text-amber-400/70"
      />
      <span class="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400/70">
        Latest from NASA
      </span>
    </div>

    <div
      v-if="status === 'pending'"
      class="flex items-center justify-center py-4"
    >
      <span class="text-[10px] text-slate-600">Loading feed...</span>
    </div>

    <div
      v-else-if="feed?.length"
      class="nasa-feed-list"
    >
      <a
        v-for="item in feed"
        :key="item.link"
        :href="item.link"
        target="_blank"
        rel="noopener noreferrer"
        class="nasa-feed-item"
      >
        <p class="nasa-feed-title">{{ item.title }}</p>
        <p class="nasa-feed-desc">{{ item.description }}</p>
        <span class="nasa-feed-date">{{ formatDate(item.pubDate) }}</span>
      </a>
    </div>

    <div
      v-else
      class="flex items-center justify-center py-4"
    >
      <span class="text-[10px] text-slate-600">No articles available</span>
    </div>
  </div>
</template>
