<script setup lang="ts">
import { formatTClock, formatLClock } from '~/utils/mission'

const { missionState } = useMissionClock()

// T-clock is inactive until "Countdown clock begins" at L-49H40M
const COUNTDOWN_START_SECONDS = 49 * 3600 + 40 * 60 // 178800

const countdownStarted = computed(() =>
  missionState.value.mode === 'met' ||
  missionState.value.secondsToLaunch <= COUNTDOWN_START_SECONDS
)

const tClockSeconds = computed(() =>
  missionState.value.mode === 'countdown'
    ? missionState.value.effectiveTSeconds
    : missionState.value.missionElapsedSeconds
)

const tClockLabel = computed(() =>
  missionState.value.mode === 'countdown' ? 'T-' : 'T+'
)

const tClockValue = computed(() => {
  const full = formatTClock(tClockSeconds.value, missionState.value.mode)
  return full.replace(/^T[+-]/, '')
})

const lClockValue = computed(() => {
  if (missionState.value.mode === 'met') return null
  return formatLClock(missionState.value.secondsToLaunch)
})
</script>

<template>
  <header class="mission-header">
    <!-- Logo -->
    <div class="header-logo">
      <div class="logo-mark">
        <UIcon name="i-lucide-rocket" class="h-3.5 w-3.5 text-white" />
      </div>
      <span class="header-mission-name">Artemis II</span>
    </div>

    <!-- Clocks -->
    <div class="header-clocks">
      <div class="clock-block">
        <template v-if="countdownStarted">
          <span class="clock-prefix" :class="missionState.mode === 'countdown' ? 'text-cyan-500' : 'text-amber-500'">
            {{ tClockLabel }}
          </span>
          <span class="clock-digits" :class="missionState.mode === 'countdown' ? 'text-cyan-200' : 'text-amber-200'">
            {{ tClockValue }}
          </span>
          <span
            v-if="missionState.inHold"
            class="ml-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400"
          >
            HOLD
          </span>
        </template>
        <template v-else>
          <span class="clock-prefix text-slate-600">T-</span>
          <span class="clock-digits text-slate-600">--:--:--</span>
        </template>
      </div>

      <div class="clock-divider" />

      <template v-if="lClockValue">
        <div class="clock-block">
          <span class="clock-prefix text-slate-500">L-</span>
          <span class="clock-digits text-slate-300">{{ lClockValue }}</span>
        </div>
      </template>
      <template v-else>
        <div class="clock-block">
          <span class="clock-prefix text-slate-500">MET</span>
          <span class="clock-digits text-slate-400">{{ tClockValue }}</span>
        </div>
      </template>
    </div>

    <!-- Status -->
    <div class="header-status">
      <div
        class="status-pill text-[11px]"
        :class="missionState.mode === 'countdown' ? 'status-pill-countdown' : 'status-pill-met'"
      >
        <span
          class="live-dot h-1.5 w-1.5 rounded-full"
          :class="missionState.mode === 'countdown' ? 'bg-cyan-400' : 'bg-amber-400'"
        />
        {{ missionState.mode === 'countdown' ? 'Pre-Launch' : 'In Flight' }}
      </div>
    </div>
  </header>
</template>
