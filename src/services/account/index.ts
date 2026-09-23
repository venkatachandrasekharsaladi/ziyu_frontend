import { isMockMode } from '@/config/env'
import { createHttpAccountService } from '@/services/account/http'
import { createMockAccountService } from '@/services/account/mock'

export type * from '@/services/account/types'

export const accountService = isMockMode
  ? createMockAccountService()
  : createHttpAccountService()
