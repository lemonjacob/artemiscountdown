import { buildTimeline, getMissionState } from '~/utils/mission'
import { LAUNCH_DATE } from '~~/shared/mission.config'
import { api } from '~~/convex/_generated/api'

export const useMissionClock = () => {
  const now = useState<number>('mission-clock-now', () => Date.now())
  let intervalId: ReturnType<typeof window.setInterval> | undefined

  const { data: launchDateFromConvex } = useConvexQuery(api.missionConfig.getLaunchDate)
  const { data: terminalCountGoFromConvex } = useConvexQuery(api.missionConfig.getTerminalCountGo)

  const dynamicLaunchMs = computed(() => {
    const fromConvex = launchDateFromConvex.value
    if (fromConvex) return Date.parse(fromConvex)
    return Date.parse(LAUNCH_DATE)
  })

  const dynamicTimeline = computed(() => buildTimeline(dynamicLaunchMs.value))

  if (import.meta.client) {
    onMounted(() => {
      now.value = Date.now()
      intervalId = window.setInterval(() => {
        now.value = Date.now()
      }, 1000)
    })

    onBeforeUnmount(() => {
      if (intervalId) {
        window.clearInterval(intervalId)
      }
    })
  }

  const missionState = computed(() =>
    getMissionState(
      now.value,
      dynamicLaunchMs.value,
      dynamicTimeline.value,
      terminalCountGoFromConvex.value ?? undefined
    )
  )

  return {
    now: readonly(now),
    missionState
  }
}
