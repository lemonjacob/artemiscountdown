import { LAUNCH_DATE, POST_LAUNCH_EVENTS, PRE_LAUNCH_EVENTS, type MissionEvent } from '~~/shared/mission.config'

export interface TimelineEvent extends MissionEvent {
  timestamp: number
  isoTime: string
  endTimestamp?: number
}

export interface MissionStateSnapshot {
  now: number
  launchMs: number
  mode: 'countdown' | 'met'
  secondsToLaunch: number
  missionElapsedSeconds: number
  timeline: TimelineEvent[]
  activeEvent: TimelineEvent | null
  activeEventIds: string[]
  nextEvent: TimelineEvent | null
  progress: number
  effectiveTSeconds: number
  inHold: boolean
}

const launchMs = Date.parse(LAUNCH_DATE)

// Built-in countdown holds: T-clock freezes during each hold period.
// All seconds are measured relative to launch (positive = seconds before launch).
// Hold 1: L-12h35m → L-9h50m, T-clock frozen at T-8:10:00
// Hold 2: L-5h10m  → L-4h00m, T-clock frozen at T-3:30:00
// Hold 3: L-40m    → L-10m,   T-clock frozen at T-0:10:00
const HOLDS = [
  { startSeconds: 45300, endSeconds: 35400, frozenT: 29400 },
  { startSeconds: 18600, endSeconds: 14400, frozenT: 12600 },
  { startSeconds: 2400,  endSeconds: 600,   frozenT: 600   },
] as const

export const getEffectiveTSeconds = (secondsToLaunch: number): number => {
  for (const hold of HOLDS) {
    if (secondsToLaunch <= hold.startSeconds && secondsToLaunch > hold.endSeconds) {
      return hold.frozenT
    }
  }
  const futureHoldTime = HOLDS
    .filter(h => secondsToLaunch > h.startSeconds)
    .reduce((sum, h) => sum + (h.startSeconds - h.endSeconds), 0)
  return Math.max(0, secondsToLaunch - futureHoldTime)
}

export const isInHold = (secondsToLaunch: number): boolean =>
  HOLDS.some(h => secondsToLaunch <= h.startSeconds && secondsToLaunch > h.endSeconds)

const toTimelineEvent = (event: MissionEvent): TimelineEvent => {
  const timestamp = launchMs + event.offsetSeconds * 1000
  const result: TimelineEvent = {
    ...event,
    timestamp,
    isoTime: new Date(timestamp).toISOString()
  }
  if (event.endOffsetSeconds !== undefined) {
    result.endTimestamp = launchMs + event.endOffsetSeconds * 1000
  }
  return result
}

const timeline = [...PRE_LAUNCH_EVENTS, ...POST_LAUNCH_EVENTS]
  .map(toTimelineEvent)
  .sort((left, right) => left.timestamp - right.timestamp)

export const getLaunchDate = () => new Date(launchMs)

export const getMissionTimeline = () => timeline

export const formatDurationParts = (totalSeconds: number) => {
  const wholeSeconds = Math.max(0, Math.floor(totalSeconds))
  const days = Math.floor(wholeSeconds / 86400)
  const hours = Math.floor((wholeSeconds % 86400) / 3600)
  const minutes = Math.floor((wholeSeconds % 3600) / 60)
  const seconds = wholeSeconds % 60

  return [
    { label: 'Days', value: String(days).padStart(2, '0') },
    { label: 'Hours', value: String(hours).padStart(2, '0') },
    { label: 'Minutes', value: String(minutes).padStart(2, '0') },
    { label: 'Seconds', value: String(seconds).padStart(2, '0') }
  ]
}

export const formatMissionOffset = (offsetSeconds: number): string => {
  if (offsetSeconds < 0) {
    const abs = Math.abs(offsetSeconds)
    const hours = Math.floor(abs / 3600)
    const minutes = Math.floor((abs % 3600) / 60)
    const seconds = abs % 60

    if (abs > 600) {
      // L- clock format (more than T-10M before launch)
      if (hours > 0 && minutes > 0) return `L-${hours}H${minutes}M`
      if (hours > 0) return `L-${hours}H`
      return `L-${minutes}M`
    } else {
      // T- terminal count format (T-10M and closer)
      if (minutes > 0 && seconds > 0) return `T-${minutes}M${seconds}S`
      if (minutes > 0) return `T-${minutes}M`
      return `T-${seconds}S`
    }
  } else {
    // Post-launch T+ format
    const days = Math.floor(offsetSeconds / 86400)
    const hours = Math.floor((offsetSeconds % 86400) / 3600)
    const minutes = Math.floor((offsetSeconds % 3600) / 60)
    const seconds = offsetSeconds % 60

    if (offsetSeconds === 0) return 'T+0'
    let result = 'T+'
    if (days > 0) result += `${days}D`
    if (hours > 0) result += `${hours}H`
    if (minutes > 0) result += `${minutes}M`
    if (seconds > 0) result += `${seconds}S`
    return result
  }
}

export const formatTClock = (totalSeconds: number, mode: 'countdown' | 'met'): string => {
  const abs = Math.max(0, Math.floor(totalSeconds))
  const prefix = mode === 'countdown' ? 'T-' : 'T+'
  const totalHours = Math.floor(abs / 3600)
  const m = Math.floor((abs % 3600) / 60)
  const s = abs % 60
  return `${prefix}${String(totalHours).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export const formatLClock = (secondsToLaunch: number): string => {
  const abs = Math.max(0, Math.floor(secondsToLaunch))
  const totalHours = Math.floor(abs / 3600)
  const m = Math.floor((abs % 3600) / 60)
  const s = abs % 60
  return `${String(totalHours).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export const formatEventTimestamp = (timestamp: number) => new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
  timeZoneName: 'short'
}).format(timestamp)

export const getMissionState = (now: number): MissionStateSnapshot => {
  const secondsToLaunch = Math.max(0, Math.floor((launchMs - now) / 1000))
  const missionElapsedSeconds = Math.max(0, Math.floor((now - launchMs) / 1000))
  const activeIndex = timeline.findLastIndex(event => event.timestamp <= now)
  const activeEvent = activeIndex >= 0 ? timeline[activeIndex] ?? null : null
  const nextEvent = timeline.find(event => event.timestamp > now) || null
  const firstTimestamp = timeline[0]?.timestamp ?? launchMs
  const lastTimestamp = timeline.at(-1)?.timestamp ?? launchMs

  const progress = now <= firstTimestamp
    ? 0
    : now >= lastTimestamp
      ? 1
      : (now - firstTimestamp) / (lastTimestamp - firstTimestamp)

  const mode: 'countdown' | 'met' = now < launchMs ? 'countdown' : 'met'
  const effectiveTSeconds = mode === 'countdown'
    ? getEffectiveTSeconds(secondsToLaunch)
    : missionElapsedSeconds
  const inHold = mode === 'countdown' && isInHold(secondsToLaunch)

  // Collect all currently active event IDs:
  // - The most recently started event (point-in-time milestone)
  // - All ranged events that have started but not yet ended
  const activeEventIdSet = new Set<string>()
  if (activeEvent) activeEventIdSet.add(activeEvent.id)
  for (const event of timeline) {
    if (
      event.endTimestamp !== undefined &&
      event.timestamp <= now &&
      event.endTimestamp > now
    ) {
      activeEventIdSet.add(event.id)
    }
  }

  return {
    now,
    launchMs,
    mode,
    secondsToLaunch,
    missionElapsedSeconds,
    timeline,
    activeEvent,
    activeEventIds: [...activeEventIdSet],
    nextEvent,
    progress,
    effectiveTSeconds,
    inHold,
  }
}
