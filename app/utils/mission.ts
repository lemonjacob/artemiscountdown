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
  terminalCountHold: boolean
}

const launchMs = Date.parse(LAUNCH_DATE)

const HOLDS = [
  { startSeconds: 45300, endSeconds: 35400, frozenT: 29400 },
  { startSeconds: 18600, endSeconds: 14400, frozenT: 12600 },
  { startSeconds: 2400, endSeconds: 600, frozenT: 600 }
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

const toTimelineEvent = (event: MissionEvent, lMs: number): TimelineEvent => {
  const timestamp = lMs + event.offsetSeconds * 1000
  const result: TimelineEvent = {
    ...event,
    timestamp,
    isoTime: new Date(timestamp).toISOString()
  }
  if (event.endOffsetSeconds !== undefined) {
    result.endTimestamp = lMs + event.endOffsetSeconds * 1000
  }
  return result
}

const timeline = [...PRE_LAUNCH_EVENTS, ...POST_LAUNCH_EVENTS]
  .map(event => toTimelineEvent(event, launchMs))
  .sort((left, right) => left.timestamp - right.timestamp)

export const buildTimeline = (customLaunchMs: number): TimelineEvent[] =>
  [...PRE_LAUNCH_EVENTS, ...POST_LAUNCH_EVENTS]
    .map(event => toTimelineEvent(event, customLaunchMs))
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
      if (hours > 0 && minutes > 0) return `L-${hours}H${minutes}M`
      if (hours > 0) return `L-${hours}H`
      return `L-${minutes}M`
    } else {
      if (minutes > 0 && seconds > 0) return `T-${minutes}M${seconds}S`
      if (minutes > 0) return `T-${minutes}M`
      return `T-${seconds}S`
    }
  } else {
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

export const formatEventEDT = (timestamp: number) => new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
  timeZoneName: 'short'
}).format(timestamp)

export const getEventClocks = (event: { offsetSeconds: number, timestamp: number }) => {
  if (event.offsetSeconds < 0) {
    const secondsToLaunch = Math.abs(event.offsetSeconds)
    const tSeconds = getEffectiveTSeconds(secondsToLaunch)
    const tAbs = Math.floor(tSeconds)
    const tH = Math.floor(tAbs / 3600)
    const tM = Math.floor((tAbs % 3600) / 60)
    const tS = tAbs % 60
    const tClock = `T-${String(tH).padStart(2, '0')}:${String(tM).padStart(2, '0')}:${String(tS).padStart(2, '0')}`

    const lAbs = Math.floor(secondsToLaunch)
    const lH = Math.floor(lAbs / 3600)
    const lM = Math.floor((lAbs % 3600) / 60)
    const lS = lAbs % 60
    const lClock = `L-${String(lH).padStart(2, '0')}:${String(lM).padStart(2, '0')}:${String(lS).padStart(2, '0')}`

    return { tClock, lClock }
  } else {
    const abs = Math.floor(event.offsetSeconds)
    const totalHours = Math.floor(abs / 3600)
    const m = Math.floor((abs % 3600) / 60)
    const s = abs % 60
    const tClock = `T+${String(totalHours).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return { tClock, lClock: null }
  }
}

const TERMINAL_COUNT_SECONDS = 600

export const getMissionState = (
  now: number,
  customLaunchMs?: number,
  customTimeline?: TimelineEvent[],
  terminalCountGo?: { isGo: boolean, goTime: number | null }
): MissionStateSnapshot => {
  const baseLaunchMs = customLaunchMs ?? launchMs
  const originalTerminalCountMs = baseLaunchMs - TERMINAL_COUNT_SECONDS * 1000

  // If go was given after the original T-10 moment, shift T-0 to goTime + 10 min
  let effectiveLaunchMs = baseLaunchMs
  if (terminalCountGo?.isGo && terminalCountGo.goTime != null && terminalCountGo.goTime > originalTerminalCountMs) {
    effectiveLaunchMs = terminalCountGo.goTime + TERMINAL_COUNT_SECONDS * 1000
  }

  const effectiveTimeline = customTimeline ?? timeline

  // Determine if we're holding at terminal count (no go, and wall clock has reached T-10)
  const terminalCountHold = !terminalCountGo?.isGo && now >= originalTerminalCountMs

  const rawSecondsToLaunch = Math.max(0, Math.floor((effectiveLaunchMs - now) / 1000))
  // When holding at terminal count, freeze secondsToLaunch at T-10 (600s) for both clocks
  const secondsToLaunch = terminalCountHold ? TERMINAL_COUNT_SECONDS : rawSecondsToLaunch

  const missionElapsedSeconds = Math.max(0, Math.floor((now - effectiveLaunchMs) / 1000))
  const activeIndex = effectiveTimeline.findLastIndex(event => event.timestamp <= now)
  const activeEvent = activeIndex >= 0 ? effectiveTimeline[activeIndex] ?? null : null
  const nextEvent = effectiveTimeline.find(event => event.timestamp > now) || null
  const firstTimestamp = effectiveTimeline[0]?.timestamp ?? effectiveLaunchMs
  const lastTimestamp = effectiveTimeline.at(-1)?.timestamp ?? effectiveLaunchMs

  const progress = now <= firstTimestamp
    ? 0
    : now >= lastTimestamp
      ? 1
      : (now - firstTimestamp) / (lastTimestamp - firstTimestamp)

  const mode: 'countdown' | 'met' = now < effectiveLaunchMs ? 'countdown' : 'met'
  const effectiveTSeconds = mode === 'countdown'
    ? (terminalCountHold ? TERMINAL_COUNT_SECONDS : getEffectiveTSeconds(secondsToLaunch))
    : missionElapsedSeconds
  const inHold = terminalCountHold || (mode === 'countdown' && isInHold(secondsToLaunch))

  const activeEventIdSet = new Set<string>()
  if (activeEvent) activeEventIdSet.add(activeEvent.id)
  for (const event of effectiveTimeline) {
    if (
      event.endTimestamp !== undefined
      && event.timestamp <= now
      && event.endTimestamp > now
    ) {
      activeEventIdSet.add(event.id)
    }
  }

  return {
    now,
    launchMs: effectiveLaunchMs,
    mode,
    secondsToLaunch,
    missionElapsedSeconds,
    timeline: effectiveTimeline,
    activeEvent,
    activeEventIds: [...activeEventIdSet],
    nextEvent,
    progress,
    effectiveTSeconds,
    inHold,
    terminalCountHold
  }
}
