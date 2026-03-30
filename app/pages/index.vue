<script setup lang="ts">
import { NASA_STREAMS } from '~~/shared/mission.config'

const { missionState } = useMissionClock()

const activePhaseFilter = ref<'all' | 'prelaunch' | 'postlaunch'>('all')

const filteredTimeline = computed(() => {
  if (activePhaseFilter.value === 'all') return missionState.value.timeline
  return missionState.value.timeline.filter(e => e.phase === activePhaseFilter.value)
})
</script>

<template>
  <div class="dashboard-root">
    <!-- Sticky header -->
    <AppHeader />

    <!-- Split body -->
    <div class="dashboard-body">
      <!-- Left: Timeline panel -->
      <section class="timeline-panel">
        <div class="panel-header">
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-list-ordered" class="h-3.5 w-3.5 text-slate-500" />
            <span class="panel-title">Mission Timeline</span>
            <span class="event-count">{{ filteredTimeline.length }}</span>
          </div>
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

      <!-- Right: Stream panel -->
      <section class="stream-panel">
        <div class="panel-header">
          <div class="flex items-center gap-3">
            <span class="live-dot h-1.5 w-1.5 rounded-full bg-red-500" />
            <span class="panel-title">NASA Livestream</span>
          </div>
          <span class="event-count">{{ NASA_STREAMS.length }} feeds</span>
        </div>

        <div class="stream-scroll">
          <LiveStream :streams="NASA_STREAMS" />

          <!-- Active event card -->
          <div v-if="missionState.activeEvent" class="active-event-card">
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

          <div v-if="missionState.nextEvent" class="next-event-card">
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
  </div>
</template>
