import { SAMPLE_HOME } from '@/sample/home'
import type { HomeDashboard, HomeService } from '@/services/home/types'

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

type MockOptions = { latencyMs?: number; dashboard?: HomeDashboard }

function sampleDashboard(): HomeDashboard {
  return {
    coupleName: SAMPLE_HOME.coupleName,
    greetingName: SAMPLE_HOME.greetingName,
    space: { name: 'Our Space', shortName: 'OS', coverStyle: 'warm' },
    daysTogether: SAMPLE_HOME.daysTogether,
    stats: SAMPLE_HOME.stats.map((stat) => ({ ...stat })),
    comingUp: SAMPLE_HOME.comingUp.map((row) => ({
      ...row,
      date: '',
      kind: row.key.toLowerCase().includes('birthday') ? 'birthday' : 'anniversary',
      source: 'story' as const,
    })),
    recentMemories: [],
    pulse: { ...SAMPLE_HOME.pulse },
  }
}

export function createMockHomeService({
  latencyMs = 600,
  dashboard = sampleDashboard(),
}: MockOptions = {}): HomeService {
  return {
    async getDashboard() {
      await wait(latencyMs)
      return { ok: true, value: dashboard }
    },
  }
}
