<script setup lang="ts">
import type { TimelineEvent } from '~/utils/mission'
import { formatEventTimestamp, formatMissionOffset } from '~/utils/mission'

defineOptions({
  name: 'MissionTimeline'
})

const props = defineProps<{
  events: TimelineEvent[]
  activeEventId: string | null
  nextEventId: string | null
  now: number
  progress: number
}>()

const progressHeight = computed(() => `${Math.max(0, Math.min(100, props.progress * 100))}%`)

const stateFor = (event: TimelineEvent) => {
  if (props.activeEventId === event.id) {
    return 'active'
  }

  if (event.timestamp < props.now) {
    return 'complete'
  }

  return 'upcoming'
}
</script>

<template>
  <div class="relative">
    <div class="absolute left-[1.05rem] top-0 h-full w-px bg-white/10" />
    <div
      class="absolute left-[1.05rem] top-0 w-px bg-gradient-to-b from-cyan-300 via-cyan-200 to-orange-300 transition-all duration-700"
      :style="{ height: progressHeight }"
    />

    <ol class="space-y-5">
      <li
        v-for="event in events"
        :key="event.id"
        class="relative grid gap-4 pl-10 md:grid-cols-[160px_minmax(0,1fr)]"
      >
        <div
          class="absolute left-0 top-2.5 flex h-8 w-8 items-center justify-center rounded-full border transition duration-500"
          :class="{
            'border-cyan-300/60 bg-cyan-300/20 shadow-[0_0_30px_rgba(34,211,238,0.3)]': stateFor(event) === 'active',
            'border-orange-300/50 bg-orange-300/15': stateFor(event) === 'complete',
            'border-white/15 bg-slate-950': stateFor(event) === 'upcoming'
          }"
        >
          <span
            class="h-2.5 w-2.5 rounded-full"
            :class="{
              'bg-cyan-300': stateFor(event) === 'active',
              'bg-orange-300': stateFor(event) === 'complete',
              'bg-slate-500': stateFor(event) === 'upcoming'
            }"
          />
        </div>

        <div class="pt-1">
          <p class="font-mono text-xs uppercase tracking-[0.25em] text-slate-500">
            {{ formatMissionOffset(event.offsetSeconds) }}
          </p>
          <p class="mt-2 text-sm text-slate-400">
            {{ formatEventTimestamp(event.timestamp) }}
          </p>
        </div>

        <article
          class="rounded-[1.6rem] border p-5 transition duration-300"
          :class="{
            'border-cyan-400/30 bg-cyan-400/10 shadow-[0_20px_60px_rgba(8,47,73,0.35)]': stateFor(event) === 'active',
            'border-orange-400/20 bg-orange-400/10': stateFor(event) === 'complete',
            'border-white/10 bg-white/[0.03]': stateFor(event) === 'upcoming'
          }"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <span
                class="rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em]"
                :class="event.phase === 'prelaunch'
                  ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200'
                  : 'border-orange-400/30 bg-orange-400/10 text-orange-200'"
              >
                {{ event.phase === 'prelaunch' ? 'Pre-Launch' : 'Flight Plan' }}
              </span>

              <span
                v-if="nextEventId === event.id"
                class="rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-300"
              >
                Next
              </span>
            </div>

            <span
              class="text-xs font-semibold uppercase tracking-[0.3em]"
              :class="{
                'text-cyan-300': stateFor(event) === 'active',
                'text-orange-300': stateFor(event) === 'complete',
                'text-slate-500': stateFor(event) === 'upcoming'
              }"
            >
              {{
                stateFor(event) === 'active'
                  ? 'Active'
                  : stateFor(event) === 'complete'
                    ? 'Completed'
                    : 'Upcoming'
              }}
            </span>
          </div>

          <h3 class="mt-4 text-xl font-semibold tracking-tight text-white">
            {{ event.title }}
          </h3>
          <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            {{ event.description }}
          </p>
        </article>
      </li>
    </ol>
  </div>
</template>
