<script setup lang="ts">
import type { TimelineEvent } from '~/utils/mission'
import { formatMissionOffset } from '~/utils/mission'

defineOptions({
  name: 'MissionTimeline'
})

const props = defineProps<{
  events: TimelineEvent[]
  activeEventIds: string[]
  nextEventId: string | null
  now: number
  progress: number
}>()

const stateFor = (event: TimelineEvent) => {
  // Ranged event: determine state from its own start/end timestamps
  if (event.endTimestamp !== undefined) {
    if (props.now >= event.endTimestamp) return 'complete'
    if (props.now >= event.timestamp) return 'active'
    return 'upcoming'
  }
  // Point-in-time event: active = currently the most-recently-started milestone
  if (props.activeEventIds.includes(event.id)) return 'active'
  if (event.timestamp < props.now) return 'complete'
  return 'upcoming'
}

const eventProgress = (event: TimelineEvent, index: number): number => {
  const state = stateFor(event)
  if (state === 'complete') return 1
  if (state === 'upcoming') return 0
  // Ranged event: use own endTimestamp for precise progress
  if (event.endTimestamp !== undefined) {
    const duration = event.endTimestamp - event.timestamp
    if (duration <= 0) return 1
    return Math.min(1, Math.max(0, (props.now - event.timestamp) / duration))
  }
  // Point-in-time: interpolate toward next event
  const nextEvent = props.events[index + 1]
  if (!nextEvent) return 1
  const duration = nextEvent.timestamp - event.timestamp
  if (duration <= 0) return 1
  return Math.min(1, Math.max(0, (props.now - event.timestamp) / duration))
}

const progressPercent = (event: TimelineEvent, index: number) =>
  Math.round(eventProgress(event, index) * 100)
</script>

<template>
  <ol class="timeline-list">
    <li
      v-for="(event, index) in events"
      :key="event.id"
      class="timeline-item"
      :class="{
        'timeline-item-active': stateFor(event) === 'active',
        'timeline-item-complete': stateFor(event) === 'complete',
        'timeline-item-next': nextEventId === event.id,
      }"
    >
      <!-- State dot -->
      <div
        class="timeline-dot"
        :class="{
          'timeline-dot-active': stateFor(event) === 'active',
          'timeline-dot-complete': stateFor(event) === 'complete',
          'timeline-dot-upcoming': stateFor(event) === 'upcoming',
        }"
      >
        <UIcon
          v-if="stateFor(event) === 'complete'"
          name="i-lucide-check"
          class="h-2.5 w-2.5 text-slate-600"
        />
        <span
          v-else
          class="h-1.5 w-1.5 rounded-full"
          :class="{
            'bg-cyan-400': stateFor(event) === 'active',
            'bg-slate-600': stateFor(event) === 'upcoming' && nextEventId !== event.id,
            'bg-white': nextEventId === event.id,
          }"
        />
      </div>

      <!-- Content -->
      <div class="timeline-content">
        <!-- Header row -->
        <div class="timeline-row">
          <div class="flex flex-wrap items-center gap-1.5 min-w-0">
            <span
              class="phase-badge"
              :class="event.phase === 'prelaunch' ? 'phase-badge-pre' : 'phase-badge-flight'"
            >
              {{ event.phase === 'prelaunch' ? 'Pre' : 'Flight' }}
            </span>

            <span v-if="nextEventId === event.id" class="next-badge">Next</span>

            <span
              class="font-mono text-[10px] text-slate-600 tabular-nums"
            >
              {{ formatMissionOffset(event.offsetSeconds) }}
            </span>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <span
              v-if="stateFor(event) === 'active'"
              class="text-[10px] font-bold uppercase tracking-[0.15em] text-cyan-400"
            >
              Live
            </span>
            <span
              v-else-if="stateFor(event) === 'complete'"
              class="text-[10px] text-slate-700 tabular-nums font-mono"
            >
              100%
            </span>
            <span
              v-else-if="stateFor(event) === 'upcoming'"
              class="text-[10px] text-slate-700 tabular-nums font-mono"
            >
              —
            </span>
          </div>
        </div>

        <!-- Title -->
        <h3
          class="timeline-title"
          :class="{
            'text-white': stateFor(event) === 'active' || nextEventId === event.id,
            'text-slate-400': stateFor(event) === 'complete',
            'text-slate-300': stateFor(event) === 'upcoming' && nextEventId !== event.id,
          }"
        >
          {{ event.title }}
        </h3>

        <!-- Progress bar -->
        <div class="progress-track">
          <div
            class="progress-fill"
            :class="{
              'progress-fill-active': stateFor(event) === 'active',
              'progress-fill-complete': stateFor(event) === 'complete',
              'progress-fill-upcoming': stateFor(event) === 'upcoming',
            }"
            :style="{ width: `${progressPercent(event, index)}%` }"
          />
        </div>

        <!-- Progress row: description + percent -->
        <div class="progress-row">
          <p
            class="timeline-description"
            :class="{
              'text-slate-400': stateFor(event) === 'active' || nextEventId === event.id,
              'text-slate-600': stateFor(event) === 'complete',
              'text-slate-500': stateFor(event) === 'upcoming' && nextEventId !== event.id,
            }"
          >
            {{ event.description }}
          </p>
          <span
            v-if="stateFor(event) === 'active'"
            class="progress-pct text-cyan-500"
          >
            {{ progressPercent(event, index) }}%
          </span>
        </div>
      </div>
    </li>
  </ol>
</template>
