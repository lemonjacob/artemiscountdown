<script setup lang="ts">
import { NASA_STREAMS, LAUNCH_DATE } from '~~/shared/mission.config'
import { formatDurationParts, formatEventTimestamp, formatMissionOffset, getLaunchDate } from '~/utils/mission'

const launchDate = getLaunchDate()
const { missionState } = useMissionClock()

const counter = computed(() => {
  const seconds = missionState.value.mode === 'countdown'
    ? missionState.value.secondsToLaunch
    : missionState.value.missionElapsedSeconds

  return formatDurationParts(seconds)
})

const statusLabel = computed(() => missionState.value.mode === 'countdown'
  ? 'Countdown To Launch'
  : 'Mission Elapsed Time')

const statusAccent = computed(() => missionState.value.mode === 'countdown'
  ? 'text-cyan-300'
  : 'text-orange-300')

const heroSummary = computed(() => {
  if (missionState.value.activeEvent) {
    return missionState.value.activeEvent.description
  }

  return 'Artemis II is tracking toward crewed lunar free-return operations around the Moon.'
})

const nextEventLabel = computed(() => {
  if (!missionState.value.nextEvent) {
    return 'Mission timeline complete'
  }

  return `${formatMissionOffset(missionState.value.nextEvent.offsetSeconds)} • ${missionState.value.nextEvent.title}`
})

const launchLabel = computed(() => formatEventTimestamp(Date.parse(LAUNCH_DATE)))
const elapsedProgress = computed(() => `${Math.round(missionState.value.progress * 100)}%`)
</script>

<template>
  <main class="relative isolate overflow-hidden">
    <div class="starfield" />
    <div class="orbital-glow orbital-glow-cyan" />
    <div class="orbital-glow orbital-glow-orange" />

    <div class="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section class="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div class="space-panel overflow-hidden p-6 sm:p-8">
          <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p class="eyebrow">
                NASA Artemis II
              </p>
              <h1 class="display-title mt-3 max-w-3xl text-balance">
                Crew mission tracker for the first Artemis voyage around the Moon.
              </h1>
            </div>

            <div class="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur">
              <span class="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.85)]" />
              Launch target: {{ launchLabel }}
            </div>
          </div>

          <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div class="space-panel-secondary p-5 sm:p-6">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <p class="text-sm font-medium uppercase tracking-[0.35em] text-slate-400">
                  {{ statusLabel }}
                </p>
                <span
                  class="rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em]"
                  :class="missionState.mode === 'countdown'
                    ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-200'
                    : 'border-orange-400/40 bg-orange-400/10 text-orange-200'"
                >
                  {{ missionState.mode === 'countdown' ? 'Pre-Launch' : 'Flight Day' }}
                </span>
              </div>

              <div class="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div
                  v-for="segment in counter"
                  :key="segment.label"
                  class="count-card"
                >
                  <div class="count-value">
                    {{ segment.value }}
                  </div>
                  <div class="count-label">
                    {{ segment.label }}
                  </div>
                </div>
              </div>

              <div class="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-300">
                <span :class="['font-semibold uppercase tracking-[0.3em]', statusAccent]">
                  {{ missionState.activeEvent ? 'Active Event' : 'Mission Status' }}
                </span>
                <span class="text-slate-500">/</span>
                <span>{{ heroSummary }}</span>
              </div>
            </div>

            <div class="space-panel-secondary flex flex-col gap-4 p-5">
              <div>
                <p class="text-xs uppercase tracking-[0.35em] text-slate-500">
                  Stage Progress
                </p>
                <div class="mt-3 text-3xl font-semibold text-white">
                  {{ elapsedProgress }}
                </div>
                <p class="mt-2 text-sm text-slate-400">
                  Progress across the published mission timeline.
                </p>
              </div>

              <div class="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                <p class="text-xs uppercase tracking-[0.35em] text-slate-500">
                  Current Stage
                </p>
                <p class="mt-3 text-lg font-semibold text-white">
                  {{ missionState.activeEvent?.title ?? 'Awaiting countdown start' }}
                </p>
                <p class="mt-2 text-sm leading-6 text-slate-400">
                  {{ heroSummary }}
                </p>
              </div>

              <div class="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                <p class="text-xs uppercase tracking-[0.35em] text-slate-500">
                  Next Event
                </p>
                <p class="mt-3 text-lg font-semibold text-white">
                  {{ nextEventLabel }}
                </p>
                <p class="mt-2 text-sm text-slate-400">
                  {{ missionState.nextEvent ? formatEventTimestamp(missionState.nextEvent.timestamp) : 'No remaining events in the current manifest.' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <aside class="space-panel flex flex-col justify-between gap-5 p-6">
          <div>
            <p class="eyebrow">
              Mission Snapshot
            </p>
            <div class="mt-5 grid gap-4">
              <div class="snapshot-card">
                <span class="snapshot-label">Launch Vehicle</span>
                <span class="snapshot-value">SLS Block 1</span>
              </div>
              <div class="snapshot-card">
                <span class="snapshot-label">Spacecraft</span>
                <span class="snapshot-value">Orion</span>
              </div>
              <div class="snapshot-card">
                <span class="snapshot-label">Trajectory</span>
                <span class="snapshot-value">Lunar Free Return</span>
              </div>
              <div class="snapshot-card">
                <span class="snapshot-label">Livestream Feeds</span>
                <span class="snapshot-value">{{ NASA_STREAMS.length.toString().padStart(2, '0') }}</span>
              </div>
            </div>
          </div>

          <div class="rounded-[2rem] border border-cyan-400/15 bg-cyan-400/5 p-5">
            <p class="text-xs uppercase tracking-[0.35em] text-cyan-200/80">
              Single Source Of Truth
            </p>
            <p class="mt-3 text-sm leading-6 text-slate-300">
              Every countdown tile, timeline state, and event timestamp is derived from
              <code class="rounded bg-black/30 px-2 py-1 text-cyan-200">LAUNCH_DATE</code>
              in the mission config.
            </p>
            <p class="mt-4 text-sm text-slate-400">
              Current value: {{ launchDate.toISOString() }}
            </p>
          </div>
        </aside>
      </section>

      <section class="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <LiveStream
          :streams="NASA_STREAMS"
          class="space-panel p-4 sm:p-5"
        />

        <div class="space-panel p-6">
          <p class="eyebrow">
            Mission Logic
          </p>
          <h2 class="section-title mt-3">
            Timeline-aware state without duplicated dates.
          </h2>
          <p class="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            Pre-launch and post-launch events are stored as offsets in seconds relative to
            a single UTC launch timestamp. The interface derives absolute times on the fly,
            highlights the current mission stage, and flips from countdown mode to MET
            without changing component structure.
          </p>

          <div class="mt-8 grid gap-4 md:grid-cols-3">
            <div class="info-card">
              <span class="info-label">Launch Epoch</span>
              <span class="info-value">{{ launchLabel }}</span>
            </div>
            <div class="info-card">
              <span class="info-label">Active Offset</span>
              <span class="info-value">
                {{ missionState.activeEvent ? formatMissionOffset(missionState.activeEvent.offsetSeconds) : 'T- pending' }}
              </span>
            </div>
            <div class="info-card">
              <span class="info-label">Local Rendering</span>
              <span class="info-value">SSR + hydrated live clock</span>
            </div>
          </div>
        </div>
      </section>

      <section class="space-panel p-6 sm:p-7">
        <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="eyebrow">
              Unified Timeline
            </p>
            <h2 class="section-title mt-3">
              From pad flow to splashdown in one continuous mission view.
            </h2>
          </div>
          <div class="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
            {{ missionState.timeline.length }} indexed milestones
          </div>
        </div>

        <Timeline
          :events="missionState.timeline"
          :active-event-id="missionState.activeEvent?.id ?? null"
          :next-event-id="missionState.nextEvent?.id ?? null"
          :now="missionState.now"
          :progress="missionState.progress"
        />
      </section>
    </div>
  </main>
</template>
