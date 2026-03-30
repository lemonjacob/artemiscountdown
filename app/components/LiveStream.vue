<script setup lang="ts">
const props = defineProps<{
  streams: readonly string[]
}>()

const labels = [
  'Mission Broadcast',
  'Media Feed',
  'Operations Feed',
  'Tracking Feed'
] as const

const extractYouTubeId = (value: string) => {
  if (!value.includes('http')) {
    return value
  }

  try {
    const url = new URL(value)

    if (url.hostname.includes('youtu.be')) {
      return url.pathname.replace('/', '')
    }

    return url.searchParams.get('v') ?? value
  } catch {
    return value
  }
}

const streamEntries = computed(() => props.streams.map((stream, index) => ({
  key: `${extractYouTubeId(stream)}-${index}`,
  label: labels[index] ?? `Feed ${String(index + 1).padStart(2, '0')}`,
  youtubeId: extractYouTubeId(stream)
})))

const activeIndex = ref(0)

watch(streamEntries, (entries) => {
  if (activeIndex.value > entries.length - 1) {
    activeIndex.value = 0
  }
}, { immediate: true })

const activeStream = computed(() => streamEntries.value[activeIndex.value] ?? null)
const embedUrl = computed(() => activeStream.value
  ? `https://www.youtube.com/embed/${activeStream.value.youtubeId}?rel=0&modestbranding=1&playsinline=1`
  : null)
</script>

<template>
  <section>
    <div class="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="eyebrow">
          NASA Livestream
        </p>
        <h2 class="section-title mt-3">
          Multi-feed viewing with fast stream switching.
        </h2>
      </div>

      <div class="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
        {{ streamEntries.length }} available feeds
      </div>
    </div>

    <div class="overflow-hidden rounded-[1.8rem] border border-white/10 bg-slate-950/90">
      <div class="aspect-video w-full">
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
      </div>
    </div>

    <div class="mt-5 grid gap-3 sm:grid-cols-3">
      <button
        v-for="(stream, index) in streamEntries"
        :key="stream.key"
        type="button"
        class="group rounded-[1.4rem] border px-4 py-4 text-left transition duration-300"
        :class="activeIndex === index
          ? 'border-cyan-400/40 bg-cyan-400/10 shadow-[0_0_0_1px_rgba(34,211,238,0.18)]'
          : 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]'"
        @click="activeIndex = index"
      >
        <div class="flex items-center justify-between gap-3">
          <span class="text-sm font-semibold text-white">
            {{ stream.label }}
          </span>
          <UIcon
            name="i-lucide-radio-tower"
            class="h-4 w-4 transition"
            :class="activeIndex === index ? 'text-cyan-300' : 'text-slate-500 group-hover:text-slate-300'"
          />
        </div>
        <p class="mt-3 text-xs uppercase tracking-[0.3em] text-slate-500">
          YouTube embed
        </p>
      </button>
    </div>
  </section>
</template>
