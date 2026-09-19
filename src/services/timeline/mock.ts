import type { TimelineService } from '@/services/timeline/types'

export function createMockTimelineService(): TimelineService {
  return {
    async list() {
      return {
        ok: true,
        value: {
          items: [
            { id: 'mock-memory', type: 'memory', date: '2025-02-14', title: 'Our favorite day' },
            { id: 'mock-story', type: 'story', date: '2024-06-01', title: 'First date' },
          ],
        },
      }
    },
  }
}
