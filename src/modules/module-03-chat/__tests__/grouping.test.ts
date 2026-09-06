import { GROUP_WINDOW_MS, groupPositions } from '@/modules/module-03-chat/grouping'
import type { Message, MessageStatus } from '@/services/chat/types'

/** Minutes past a fixed UTC noon, so a case reads as "three minutes later". */
const at = (minutes: number) =>
  new Date(Date.UTC(2026, 7, 30, 12, 0) + minutes * 60_000).toISOString()

const message = (
  id: string,
  authorId: 'me' | 'partner',
  minutes: number,
  status: MessageStatus = 'read',
): Message => ({
  id,
  authorId,
  kind: 'text',
  body: id,
  reactions: [],
  pinned: false,
  sentAt: at(minutes),
  status,
})

describe('groupPositions', () => {
  it('returns nothing for an empty thread', () => {
    expect(groupPositions([])).toEqual([])
  })

  it('makes a lone message both the start and the end of its run', () => {
    expect(groupPositions([message('m1', 'me', 0)])).toEqual([{ isFirst: true, isLast: true }])
  })

  it('groups consecutive messages from one author sent close together', () => {
    const positions = groupPositions([
      message('m1', 'me', 0),
      message('m2', 'me', 1),
      message('m3', 'me', 2),
    ])

    expect(positions).toEqual([
      { isFirst: true, isLast: false },
      { isFirst: false, isLast: false },
      { isFirst: false, isLast: true },
    ])
  })

  it('starts a new run when the author changes', () => {
    const positions = groupPositions([
      message('m1', 'partner', 0),
      message('m2', 'me', 1),
    ])

    expect(positions).toEqual([
      { isFirst: true, isLast: true },
      { isFirst: true, isLast: true },
    ])
  })

  it('starts a new run once the gap exceeds the window, however same the author', () => {
    const justInside = GROUP_WINDOW_MS / 60_000 - 1
    const justOutside = GROUP_WINDOW_MS / 60_000 + 1

    expect(groupPositions([message('m1', 'me', 0), message('m2', 'me', justInside)])).toEqual([
      { isFirst: true, isLast: false },
      { isFirst: false, isLast: true },
    ])

    expect(groupPositions([message('m1', 'me', 0), message('m2', 'me', justOutside)])).toEqual([
      { isFirst: true, isLast: true },
      { isFirst: true, isLast: true },
    ])
  })

  // A failed send carries a status mark and a Retry control, and the bubble
  // only draws those on the last message of a run. Letting a failure sit
  // mid-run would hide the one control that fixes it, so a failure always
  // stands alone — the run ends at it, and the next message starts fresh.
  it('stands a failed send on its own, so its retry is never hidden mid-run', () => {
    const positions = groupPositions([
      message('m1', 'me', 0),
      message('m2', 'me', 1, 'failed'),
      message('m3', 'me', 2),
    ])

    expect(positions).toEqual([
      { isFirst: true, isLast: true },
      { isFirst: true, isLast: true },
      { isFirst: true, isLast: true },
    ])
  })

  it('reads the thread in order, so a run can follow a run', () => {
    const positions = groupPositions([
      message('m1', 'partner', 0),
      message('m2', 'partner', 1),
      message('m3', 'me', 2),
      message('m4', 'me', 3),
    ])

    expect(positions).toEqual([
      { isFirst: true, isLast: false },
      { isFirst: false, isLast: true },
      { isFirst: true, isLast: false },
      { isFirst: false, isLast: true },
    ])
  })
})
