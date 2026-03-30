<script setup lang="ts">
export interface StreamEntry {
  youtubeId: string
  label: string
}

const props = defineProps<{
  streams: readonly StreamEntry[]
}>()

const extractYouTubeId = (value: string) => {
  if (!value.includes('http')) return value
  try {
    const url = new URL(value)
    if (url.hostname.includes('youtu.be')) return url.pathname.replace('/', '')
    return url.searchParams.get('v') ?? value
  } catch {
    return value
  }
}

const streamEntries = computed(() => props.streams.map((stream, index) => ({
  key: `${extractYouTubeId(stream.youtubeId)}-${index}`,
  label: stream.label,
  youtubeId: extractYouTubeId(stream.youtubeId)
})))

const activeIndex = ref(0)

watch(streamEntries, (entries) => {
  if (activeIndex.value > entries.length - 1) activeIndex.value = 0
}, { immediate: true })

const activeStream = computed(() => streamEntries.value[activeIndex.value] ?? null)
const embedUrl = computed(() => activeStream.value
  ? `https://www.youtube.com/embed/${activeStream.value.youtubeId}?rel=0&modestbranding=1&playsinline=1`
  : null)
</script>

<template>
  <div class="stream-container">
    <!-- Video -->
    <div class="video-wrapper">
      <iframe
        v-if="embedUrl"
        :src="embedUrl"
        :title="activeStream?.label ?? 'NASA Livestream'"
        class="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        loading="lazy"
        referrerpolicy="strict-origin-when-cross-origin"
      />
      <div v-else class="flex h-full items-center justify-center">
        <span class="text-xs text-slate-600">No feed selected</span>
      </div>
    </div>

    <!-- Feed selector -->
    <div class="feed-selector">
      <button
        v-for="(stream, index) in streamEntries"
        :key="stream.key"
        type="button"
        class="feed-btn"
        :class="activeIndex === index ? 'feed-btn-active' : ''"
        @click="activeIndex = index"
      >
        <span
          class="feed-dot"
          :class="activeIndex === index ? 'bg-red-400' : 'bg-slate-700'"
        />
        <span class="feed-label" :class="activeIndex === index ? 'text-white' : 'text-slate-400'">
          {{ stream.label }}
        </span>
        <UIcon
          v-if="activeIndex === index"
          name="i-lucide-radio"
          class="ml-auto h-3 w-3 text-red-400"
        />
      </button>
    </div>
  </div>
</template>
