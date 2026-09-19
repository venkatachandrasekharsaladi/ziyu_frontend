import { useEffect } from 'react'

import { isMockMode } from '@/config/env'
import {
  authService,
  getCachedSession,
  setCachedSession,
  subscribeToSession,
} from '@/services/auth'
import { accountService } from '@/services/account'
import { calendarService } from '@/services/calendar'
import { dailyQuestionService } from '@/services/dailyQuestions'
import { homeService } from '@/services/home'
import { memoriesService } from '@/services/memories'
import { notificationService } from '@/services/notifications'
import { pairingService } from '@/services/pairing'
import { repairSignalService } from '@/services/repairSignal'
import { storyService } from '@/services/story'
import { timelineService } from '@/services/timeline'
import { getRefreshToken, hydrate as hydrateTokens, subscribeToTokens } from '@/services/http/tokens'
import { useAccountStore } from '@/state/accountStore'
import { useCalendarStore } from '@/state/calendarStore'
import { useDailyQuestionStore } from '@/state/dailyQuestionStore'
import { useHomeStore } from '@/state/homeStore'
import { useNotificationStore } from '@/state/notificationStore'
import { useRelationshipStore } from '@/state/relationshipStore'
import { useRepairSignalStore } from '@/state/repairSignalStore'
import { useMemoriesStore } from '@/state/memoriesStore'
import { useSpaceStore } from '@/state/spaceStore'
import { useStoryStore } from '@/state/storyStore'
import { useTimelineStore } from '@/state/timelineStore'
import { useAppBootstrapStore } from '@/state/appBootstrapStore'

/** Restores durable couple state in dependency order after token refresh. */
export function useServerStateHydration() {
  const syncRelationship = useRelationshipStore((state) => state.syncWithServer)
  const syncSpace = useSpaceStore((state) => state.syncWithServer)
  const hydrateStory = useStoryStore((state) => state.hydrate)
  const hydrateMemories = useMemoriesStore((state) => state.hydrate)
  const hydrateCalendar = useCalendarStore((state) => state.hydrate)
  const hydrateDailyQuestion = useDailyQuestionStore((state) => state.hydrate)
  const hydrateHome = useHomeStore((state) => state.hydrate)
  const hydrateAccount = useAccountStore((state) => state.hydrate)
  const hydrateNotifications = useNotificationStore((state) => state.hydrate)
  const hydrateRepairSignal = useRepairSignalStore((state) => state.hydrate)
  const hydrateTimeline = useTimelineStore((state) => state.hydrate)
  const retryKey = useAppBootstrapStore((state) => state.retryKey)

  useEffect(() => {
    const retry = () => {
      const bootstrap = useAppBootstrapStore.getState()
      if (bootstrap.phase !== 'hydrating') bootstrap.retry()
    }
    const unsubscribeSession = subscribeToSession(retry)
    const unsubscribeTokens = subscribeToTokens((tokens) => {
      if (!tokens) {
        setCachedSession(null)
        useRelationshipStore.getState().reset()
        useSpaceStore.getState().reset()
        useStoryStore.getState().reset()
        useMemoriesStore.getState().reset()
        useCalendarStore.getState().reset()
        useDailyQuestionStore.getState().reset()
        useHomeStore.getState().reset()
        useAccountStore.getState().reset()
        useNotificationStore.getState().reset()
        useRepairSignalStore.getState().reset()
        useTimelineStore.getState().reset()
        useAppBootstrapStore.getState().resolveUnauthenticated()
      }
    })
    return () => {
      unsubscribeSession()
      unsubscribeTokens()
    }
  }, [])

  useEffect(() => {
    let active = true

    async function hydrate() {
      const bootstrap = useAppBootstrapStore.getState()
      bootstrap.begin()

      let session = getCachedSession()
      if (!isMockMode) {
        await hydrateTokens()
        if (!getRefreshToken()) {
          if (active) bootstrap.resolveUnauthenticated()
          return
        }
        const current = await authService.getCurrentSession()
        if (!active) return
        if (!current.ok) {
          if (current.error.code === 'NETWORK') bootstrap.resolveOffline(session)
          else bootstrap.resolveUnauthenticated()
          return
        }
        session = current.value
      }

      if (!session) {
        if (active) bootstrap.resolveUnauthenticated()
        return
      }
      if (!session.emailVerified) {
        if (active) bootstrap.resolveUnverified(session)
        return
      }

      if (isMockMode) {
        const relationship = useRelationshipStore.getState()
        const localSpace = useSpaceStore.getState()
        const status = relationship.status
        bootstrap.resolveReady(session, {
          coupleId: status === 'none' ? undefined : 'mock-couple',
          name: localSpace.name ?? undefined,
          shortName: localSpace.shortName ?? undefined,
          coverStyle: localSpace.coverStyle,
          status,
          partner: relationship.partner ?? undefined,
        })
        return
      }

      const space = await pairingService.getSpace()
      if (!active) return
      if (!space.ok) {
        bootstrap.resolveOffline(session)
        return
      }
      syncRelationship(space.value)
      syncSpace(space.value)
      bootstrap.resolveReady(session, space.value)

      if (!space.value.coupleId) return
      const story = await storyService.getStory()
      if (active && story.ok) hydrateStory(story.value)

      const memories = await memoriesService.list()
      if (active && memories.ok) hydrateMemories(memories.value)

      const [events, upcoming, home, lifecycle, deletion, notifications, timeline, dailyQuestion, repairSignal] = await Promise.all([
        calendarService.list(),
        calendarService.upcoming(),
        homeService.getDashboard(),
        pairingService.getLifecycle(),
        accountService.getDeletionStatus(),
        notificationService.getPreferences(),
        timelineService.list(),
        dailyQuestionService.getToday(),
        repairSignalService.current(),
      ])
      if (!active) return
      if (events.ok) hydrateCalendar(events.value, upcoming.ok ? upcoming.value : [])
      if (home.ok) hydrateHome(home.value)
      if (lifecycle.ok && deletion.ok) hydrateAccount(lifecycle.value, deletion.value)
      if (notifications.ok) hydrateNotifications(notifications.value)
      if (timeline.ok) hydrateTimeline(timeline.value)
      if (dailyQuestion.ok) hydrateDailyQuestion(dailyQuestion.value)
      if (repairSignal.ok) hydrateRepairSignal(repairSignal.value)
    }

    void hydrate()
    return () => {
      active = false
    }
  }, [
    hydrateAccount, hydrateCalendar, hydrateDailyQuestion, hydrateHome, hydrateMemories, hydrateNotifications,
    hydrateRepairSignal, hydrateStory, hydrateTimeline, retryKey, syncRelationship, syncSpace,
  ])
}