<script setup lang="ts">
import { NASA_STREAMS } from '~~/shared/mission.config'
import { api } from '~~/convex/_generated/api'
import { formatTClock, SPLASHDOWN_MET_SECONDS } from '~/utils/mission'

const { missionState } = useMissionClock()

const { data: convexStreams } = useConvexQuery(api.streams.list)

const streams = computed(() => {
  const fromConvex = convexStreams.value
  if (fromConvex && fromConvex.length > 0) return fromConvex
  const fallbackLabels = [
    '24/7 Views',
    'Launch Stream Coverage',
    'Operations Feed',
    'Tracking Feed'
  ]
  return NASA_STREAMS.map((id, i) => ({
    youtubeId: id,
    label: fallbackLabels[i] ?? `Feed ${i + 1}`
  }))
})

const activePhaseFilter = ref<'all' | 'prelaunch' | 'postlaunch'>('all')

const filteredTimeline = computed(() => {
  if (activePhaseFilter.value === 'all') return missionState.value.timeline
  return missionState.value.timeline.filter(e => e.phase === activePhaseFilter.value)
})

const mobileTab = ref<'timeline' | 'stream'>('timeline')
const showCompletedTimeline = ref(false)

const isMissionComplete = computed(
  () => missionState.value.mode === 'met' && missionState.value.nextEvent === null
)

watch(isMissionComplete, (complete) => {
  if (!complete) showCompletedTimeline.value = false
})

const metClockValue = computed(() => {
  const seconds = isMissionComplete.value
    ? SPLASHDOWN_MET_SECONDS
    : missionState.value.missionElapsedSeconds
  return formatTClock(seconds, 'met').replace(/^T\+/, '')
})
</script>

<template>
  <div class="dashboard-root">
    <AppHeader />

    <!-- Mission Complete Layout -->
    <div
      v-if="isMissionComplete && !showCompletedTimeline"
      class="mission-complete-root"
    >
      <div class="mission-complete-hero">
        <div class="mission-complete-icon-ring">
          <UIcon
            name="i-lucide-earth"
            class="h-8 w-8 text-cyan-300"
          />
        </div>
        <p class="mission-complete-eyebrow">
          Mission Accomplished
        </p>
        <h1 class="mission-complete-heading">
          Artemis II
        </h1>
        <p class="mission-complete-subheading">
          Splashdown confirmed. All crew safe.
        </p>
        <div class="mission-complete-met">
          <span class="mission-complete-met-label">Mission Elapsed Time</span>
          <span class="mission-complete-met-clock">T+{{ metClockValue }}</span>
        </div>
        <button
          type="button"
          class="mission-complete-timeline-btn"
          @click="showCompletedTimeline = true"
        >
          <UIcon
            name="i-lucide-list-ordered"
            class="h-4 w-4"
          />
          View Completed Timeline
        </button>
      </div>

      <div class="mission-complete-feed">
        <div class="mission-complete-feed-header">
          <UIcon
            name="i-lucide-rss"
            class="h-3.5 w-3.5 text-amber-400/70"
          />
          <span class="panel-title">NASA Updates</span>
        </div>
        <div class="mission-complete-feed-body">
          <NasaFeed />
        </div>
      </div>
    </div>

    <!-- Normal Dashboard Layout -->
    <template v-else>
      <div class="mobile-tab-bar md:hidden">
        <button
          type="button"
          class="mobile-tab-btn"
          :class="mobileTab === 'timeline' ? 'mobile-tab-btn-active' : ''"
          @click="mobileTab = 'timeline'"
        >
          <UIcon
            name="i-lucide-list-ordered"
            class="h-4 w-4"
          />
          Timeline
        </button>
        <button
          type="button"
          class="mobile-tab-btn"
          :class="mobileTab === 'stream' ? 'mobile-tab-btn-active' : ''"
          @click="mobileTab = 'stream'"
        >
          <UIcon
            name="i-lucide-radio"
            class="h-4 w-4"
          />
          Live Feed
        </button>
      </div>
      <div class="dashboard-body">
        <section
          class="timeline-panel"
          :class="{ 'panel-mobile-hidden': mobileTab !== 'timeline' }"
        >
          <div class="panel-header">
            <div class="flex items-center gap-3">
              <UIcon
                name="i-lucide-list-ordered"
                class="h-3.5 w-3.5 text-slate-500"
              />
              <span class="panel-title">Mission Timeline</span>
            </div>
            <button
              v-if="isMissionComplete && showCompletedTimeline"
              type="button"
              class="timeline-summary-btn"
              @click="showCompletedTimeline = false"
            >
              <UIcon
                name="i-lucide-circle-check"
                class="h-3.5 w-3.5"
              />
              Summary
            </button>
            <div class="phase-filters">
              <button
                v-for="opt in [
                  { key: 'all', label: 'All' },
                  { key: 'prelaunch', label: 'Pre-Launch' },
                  { key: 'postlaunch', label: 'Flight' }
                ] as const"
                :key="opt.key"
                type="button"
                class="filter-btn"
                :class="activePhaseFilter === opt.key ? 'filter-btn-active' : ''"
                @click="activePhaseFilter = opt.key"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <div class="timeline-scroll">
            <Timeline
              :events="filteredTimeline"
              :active-event-ids="missionState.activeEventIds"
              :next-event-id="missionState.nextEvent?.id ?? null"
              :now="missionState.now"
              :progress="missionState.progress"
            />
          </div>
        </section>

        <section
          class="stream-panel"
          :class="{ 'panel-mobile-hidden': mobileTab !== 'stream' }"
        >
          <div class="panel-header">
            <div class="flex items-center gap-3">
              <span class="live-dot h-1.5 w-1.5 rounded-full bg-red-500" />
              <span class="panel-title">NASA Livestream</span>
            </div>
          </div>

          <div class="stream-scroll">
            <LiveStream :streams="streams" />
            <div
              v-if="missionState.activeEvent"
              class="active-event-card"
            >
              <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400/70">
                Active Event
              </p>
              <p class="mt-1.5 text-sm font-semibold text-white">
                {{ missionState.activeEvent.title }}
              </p>
              <p class="mt-1 text-xs leading-5 text-slate-400">
                {{ missionState.activeEvent.description }}
              </p>
            </div>
            <StatusMessages />

            <NasaFeed />

            <div
              v-if="missionState.nextEvent"
              class="next-event-card"
            >
              <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Up Next
              </p>
              <p class="mt-1.5 text-sm font-medium text-slate-200">
                {{ missionState.nextEvent.title }}
              </p>
            </div>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>
