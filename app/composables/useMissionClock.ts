import { getMissionState } from '~/utils/mission'

export const useMissionClock = () => {
  const now = useState<number>('mission-clock-now', () => Date.now())
  let intervalId: ReturnType<typeof window.setInterval> | undefined

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

  const missionState = computed(() => getMissionState(now.value))

  return {
    now: readonly(now),
    missionState
  }
}
