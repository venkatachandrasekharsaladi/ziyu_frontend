import { create } from 'zustand'

import { memoriesService } from '@/services/memories'
import type { Memory } from '@/services/memories/types'

type MemoriesState = {
  memories: Memory[]
  hydrated: boolean
  hydrate: (memories: Memory[]) => void
  add: (memory: Memory) => void
  replace: (memory: Memory) => void
  updatePrivateNote: (id: string, note: string) => Promise<boolean>
  withdrawPrivateNote: (id: string) => Promise<boolean>
  remove: (id: string) => void
  reset: () => void
}

/** Durable shared memories restored during authenticated app bootstrap. */
export const useMemoriesStore = create<MemoriesState>((set) => ({
  memories: [],
  hydrated: false,
  hydrate: (memories) => set({ memories, hydrated: true }),
  add: (memory) => set((state) => ({ memories: [memory, ...state.memories] })),
  replace: (memory) =>
    set((state) => ({
      memories: state.memories.map((item) => (item.id === memory.id ? memory : item)),
    })),
  updatePrivateNote: async (id, note) => {
    const result = await memoriesService.updatePrivateNote({ id, note })
    if (!result.ok) return false
    set((state) => ({
      memories: state.memories.map((item) => (item.id === id ? result.value : item)),
    }))
    return true
  },
  withdrawPrivateNote: async (id) => {
    const result = await memoriesService.withdrawPrivateNote({ id })
    if (!result.ok) return false
    set((state) => ({
      memories: state.memories.map((item) => (item.id === id ? result.value : item)),
    }))
    return true
  },
  remove: (id) =>
    set((state) => ({ memories: state.memories.filter((memory) => memory.id !== id) })),
  reset: () => set({ memories: [], hydrated: false }),
}))
