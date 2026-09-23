/**
 * PAIRING OVER HTTP.
 *
 * Implements `PairingService` exactly. The interesting work is not the calls —
 * they map one-to-one onto `/v1/pairing` — but the two shape mismatches the
 * mock never had to face:
 *
 *   1. `photoUri` from the profile screen is a local `file://` path. The server
 *      stores URLs the *partner* can load, so it is uploaded first. This is why
 *      `createProfile` is not a straight passthrough.
 *
 *   2. `redeemCode` deliberately does not join anything. The design shows a
 *      confirmation screen between "enter code" and "you are paired", and a
 *      mistyped code has to be recoverable. `confirmPartner` is the commit.
 */
import { requireApiUrl } from '@/config/env'
import { get, post, put } from '@/services/http/client'
import { toPairingErrorCode } from '@/services/http/errors'
import { ensureRemoteUri } from '@/services/media'
import type {
  Invite,
  CoupleLifecycle,
  PairingService,
  Partner,
  Profile,
  Result,
  SpaceStatus,
} from '@/services/pairing/types'

const ok = <T>(value: T): Result<T> => ({ ok: true, value })
const fail = (error: unknown): Result<never> => ({
  ok: false,
  error: { code: toPairingErrorCode(error) },
})

export function createHttpPairingService(): PairingService {
  requireApiUrl()

  return {
    async createProfile(input: Profile): Promise<Result<Profile>> {
      try {
        const photoUri = await ensureRemoteUri(input.photoUri)
        /**
         * `PUT` rather than `POST`: the same screen is used to create and to
         * edit, and re-submitting an unchanged profile must not create a
         * second one. The endpoint is an idempotent replace.
         */
        const profile = await put<Profile>('/pairing/profile', { ...input, photoUri })
        return ok(profile)
      } catch (error) {
        return fail(error)
      }
    },

    /**
     * Creates the couple on first call and cancels any previous live code —
     * one outstanding invite at a time, so a user who reopens the screen cannot
     * end up with two valid codes in circulation.
     */
    async createInvite(): Promise<Result<Invite>> {
      try {
        return ok(await post<Invite>('/pairing/invites'))
      } catch (error) {
        return fail(error)
      }
    },

    /**
     * The code is sent as typed. Normalisation — case, spaces, the display
     * hyphen — happens on the server, so both clients cannot drift apart on
     * what "the same code" means.
     */
    async redeemCode(input: { code: string }): Promise<Result<Partner>> {
      try {
        return ok(await post<Partner>('/pairing/redeem', input))
      } catch (error) {
        return fail(error)
      }
    },

    /**
     * `partnerId` is checked against the invite this account personally
     * redeemed, so posting somebody else's id joins nothing. The client is not
     * trusted to name its own partner.
     */
    async confirmPartner(input: { partnerId: string }): Promise<Result<null>> {
      try {
        await post('/pairing/confirm', input)
        return ok(null)
      } catch (error) {
        return fail(error)
      }
    },

    async cancelInvite(input: { code: string }): Promise<Result<null>> {
      try {
        await post('/pairing/invites/cancel', input)
        return ok(null)
      } catch (error) {
        return fail(error)
      }
    },

    async getSpace(): Promise<Result<SpaceStatus>> {
      try {
        return ok(await get<SpaceStatus>('/pairing/space'))
      } catch (error) {
        return fail(error)
      }
    },

    async getLifecycle(): Promise<Result<CoupleLifecycle>> {
      try { return ok(await get<CoupleLifecycle>('/pairing/lifecycle')) }
      catch (error) { return fail(error) }
    },

    async pause(): Promise<Result<CoupleLifecycle>> {
      try { return ok(await post<CoupleLifecycle>('/pairing/lifecycle/pause')) }
      catch (error) { return fail(error) }
    },

    async reactivate(): Promise<Result<CoupleLifecycle>> {
      try { return ok(await post<CoupleLifecycle>('/pairing/lifecycle/reactivate')) }
      catch (error) { return fail(error) }
    },

    async requestUnpair(): Promise<Result<CoupleLifecycle>> {
      try { return ok(await post<CoupleLifecycle>('/pairing/lifecycle/unpair')) }
      catch (error) { return fail(error) }
    },

    async cancelUnpair(): Promise<Result<CoupleLifecycle>> {
      try { return ok(await post<CoupleLifecycle>('/pairing/lifecycle/unpair/cancel')) }
      catch (error) { return fail(error) }
    },
  }
}
