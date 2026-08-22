/**
 * SAMPLE CONTENT — the UI's stand-in until a backend exists.
 *
 * Imported by screens only. Nothing under `services/` or `state/` reads from
 * here, so deleting this directory is a UI-layer change and never a data-layer
 * one.
 */
export { SAMPLE_MEMORIES } from '@/sample/memories'
export { SAMPLE_ALBUMS, findAlbum, memoriesInAlbum, type Album } from '@/sample/albums'
export { SAMPLE_HOME } from '@/sample/home'

/**
 * THE SWITCH.
 *
 * `true` while the UI is being built ahead of the backend: screens whose real
 * source is empty fall back to sample content so the designed layout is what
 * you see. Flip to `false` and every screen returns to its genuine empty state
 * — which is why those empty states are still built and still tested rather
 * than deleted in favour of the sample.
 */
export const USE_SAMPLE_CONTENT = true
