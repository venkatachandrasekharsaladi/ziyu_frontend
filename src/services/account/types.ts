export type DeletionStatus = {
  pending: boolean
  requestedAt?: string | null
  executeAfter?: string | null
  cancelledAt?: string | null
  executedAt?: string | null
}

export type AccountExport = {
  generatedAt: string
  data: Record<string, unknown>
}

export type AccountResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: { code: 'NETWORK' | 'UNKNOWN' } }

export type AccountService = {
  getDeletionStatus: () => Promise<AccountResult<DeletionStatus>>
  requestDeletion: () => Promise<AccountResult<DeletionStatus>>
  cancelDeletion: () => Promise<AccountResult<DeletionStatus>>
  exportData: () => Promise<AccountResult<AccountExport>>
}
