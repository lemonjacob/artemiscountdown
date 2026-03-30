import { LAUNCH_DATE, POST_LAUNCH_EVENTS, PRE_LAUNCH_EVENTS, type MissionEvent } from '~~/shared/mission.config'

export interface TimelineEvent extends MissionEvent {
  timestamp: number
  isoTime: string
}

export interface MissionStateSnapshot {
  now: number
  launchMs: number
  mode: 'countdown' | 'met'
  secondsToLaunch: number
  missionElapsedSeconds: number
  timeline: TimelineEvent[]
  activeEvent: TimelineEvent | null
  nextEvent: TimelineEvent | null
  progress: number
}

const launchMs = Date.parse(LAUNCH_DATE)

const toTimelineEvent = (event: MissionEvent): TimelineEvent => {
  const timestamp = launchMs + event.offsetSeconds * 1000

  return {
    ...event,
    timestamp,
    isoTime: new Date(timestamp).toISOString()
  }
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

export const formatMissionOffset = (offsetSeconds: number) => {
  const sign = offsetSeconds >= 0 ? '+' : '-'
  const absolute = Math.abs(offsetSeconds)
  const days = Math.floor(absolute / 86400)
  const hours = Math.floor((absolute % 86400) / 3600)
  const minutes = Math.floor((absolute % 3600) / 60)
  const seconds = absolute % 60
  const time = [hours, minutes, seconds].map(part => String(part).padStart(2, '0')).join(':')

  return days > 0 ? `T${sign}${days}/${time}` : `T${sign}${time}`
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

  return {
    now,
    launchMs,
    mode: now < launchMs ? 'countdown' : 'met',
    secondsToLaunch,
    missionElapsedSeconds,
    timeline,
    activeEvent,
    nextEvent,
    progress
  }
}
