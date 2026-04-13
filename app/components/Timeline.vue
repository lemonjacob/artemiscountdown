<script setup lang="ts">
import type { TimelineEvent } from '~/utils/mission'
import { formatMissionOffset, formatEventEDT, getEventClocks } from '~/utils/mission'

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

const listRef = ref<HTMLOListElement | null>(null)
const itemRefs = ref<HTMLLIElement[]>([])

onBeforeUpdate(() => {
  itemRefs.value = []
})

const lastScrolledForKey = ref<string | null>(null)

function scrollToFirstActive() {
  const firstActiveIndex = props.events.findIndex(
    e => props.activeEventIds.includes(e.id) || props.nextEventId === e.id
  )
  if (firstActiveIndex < 0) return

  const scrollKey = props.events[firstActiveIndex]?.id ?? null
  if (scrollKey === lastScrolledForKey.value) return
  lastScrolledForKey.value = scrollKey

  const scrollContainer = listRef.value?.parentElement
  if (!scrollContainer) return

  const targetIndex = Math.max(0, firstActiveIndex - 1)
  const targetEl = itemRefs.value[targetIndex]
  if (!targetEl) return

  const containerRect = scrollContainer.getBoundingClientRect()
  const targetRect = targetEl.getBoundingClientRect()
  scrollContainer.scrollTop += targetRect.top - containerRect.top
}

onMounted(() => nextTick(scrollToFirstActive))

watch(
  () => [props.activeEventIds, props.nextEventId, props.events] as const,
  () => nextTick(scrollToFirstActive)
)

const stateFor = (event: TimelineEvent) => {
  if (event.endTimestamp !== undefined) {
    if (props.now >= event.endTimestamp) return 'complete'
    if (props.now >= event.timestamp) return 'active'
    return 'upcoming'
  }
  if (props.activeEventIds.includes(event.id)) return 'active'
  if (event.timestamp < props.now) return 'complete'
  return 'upcoming'
}

const eventProgress = (event: TimelineEvent, index: number): number => {
  const state = stateFor(event)
  if (state === 'complete') return 1
  if (state === 'upcoming') return 0
  if (event.endTimestamp !== undefined) {
    const duration = event.endTimestamp - event.timestamp
    if (duration <= 0) return 1
    return Math.min(1, Math.max(0, (props.now - event.timestamp) / duration))
  }
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
  <ol
    ref="listRef"
    class="timeline-list"
  >
    <li
      v-for="(event, index) in events"
      :ref="
        (el: HTMLLIElement) => {
          if (el) itemRefs[index] = el as HTMLLIElement;
        }
      "
      :key="event.id"
      class="timeline-item"
      :class="{
        'timeline-item-active': stateFor(event) === 'active',
        'timeline-item-complete': stateFor(event) === 'complete',
        'timeline-item-next': nextEventId === event.id
      }"
    >
      <div
        class="timeline-dot"
        :class="{
          'timeline-dot-active': stateFor(event) === 'active',
          'timeline-dot-complete': stateFor(event) === 'complete',
          'timeline-dot-upcoming': stateFor(event) === 'upcoming'
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
            'bg-white': nextEventId === event.id
          }"
        />
      </div>
      <div class="timeline-content">
        <div class="timeline-row">
          <div class="flex flex-wrap items-center gap-1.5 min-w-0">
            <span
              class="phase-badge"
              :class="event.phase === 'prelaunch' ? 'phase-badge-pre' : 'phase-badge-flight'"
            >
              {{ event.phase === "prelaunch" ? "Pre" : "Flight" }}
            </span>

            <span
              v-if="event.tag"
              :class="event.tag === 'tanking' ? 'tag-badge-tanking' : 'tag-badge-terminal-count'"
            >{{ event.tag === "tanking" ? "Tanking" : "Terminal" }}</span>

            <span
              v-if="nextEventId === event.id"
              class="next-badge"
            >Next</span>

            <span class="font-mono text-[10px] text-slate-600 tabular-nums">
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

        <div class="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 mb-1">
          <span
            class="font-mono text-[10px] tabular-nums"
            :class="stateFor(event) === 'complete' ? 'text-slate-700' : 'text-slate-500'"
          >{{ formatEventEDT(event.timestamp) }}</span>
          <template v-if="event.phase === 'prelaunch'">
            <span
              class="font-mono text-[10px] tabular-nums"
              :class="stateFor(event) === 'complete' ? 'text-slate-700' : 'text-slate-500'"
            >{{ getEventClocks(event).lClock }}</span>
          </template>
          <span
            class="font-mono text-[10px] tabular-nums"
            :class="
              stateFor(event) === 'active'
                ? 'text-cyan-500/80'
                : stateFor(event) === 'complete'
                  ? 'text-slate-700'
                  : 'text-slate-500'
            "
          >{{ getEventClocks(event).tClock }}</span>
        </div>

        <h3
          class="timeline-title"
          :class="{
            'text-white': stateFor(event) === 'active' || nextEventId === event.id,
            'text-slate-400': stateFor(event) === 'complete',
            'text-slate-300': stateFor(event) === 'upcoming' && nextEventId !== event.id
          }"
        >
          {{ event.title }}
        </h3>

        <div class="progress-track">
          <div
            class="progress-fill"
            :class="{
              'progress-fill-active': stateFor(event) === 'active',
              'progress-fill-complete': stateFor(event) === 'complete',
              'progress-fill-upcoming': stateFor(event) === 'upcoming'
            }"
            :style="{ width: `${progressPercent(event, index)}%` }"
          />
        </div>
        <div class="progress-row">
          <p
            class="timeline-description"
            :class="{
              'text-slate-400': stateFor(event) === 'active' || nextEventId === event.id,
              'text-slate-600': stateFor(event) === 'complete',
              'text-slate-500': stateFor(event) === 'upcoming' && nextEventId !== event.id
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
