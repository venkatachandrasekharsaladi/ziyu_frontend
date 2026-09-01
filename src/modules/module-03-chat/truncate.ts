/**
 * Cuts a preview at the last whole word that fits, never mid-word.
 *
 * Figma's own Chat Home frame (3390:764) does not truncate its message
 * preview at all — the text node holds the full, untruncated line; the
 * frame's fixed-height box just overflows and visually CLIPS it, mid-word,
 * in the render (confirmed against the parity fixture: node 3390:792 carries
 * the complete sentence). That clip is a defect to correct, not a shape to
 * reproduce: a preview that stops mid-word reads as broken text, not a hint
 * that there is more to read. This walks the cut back from the raw character
 * boundary to the previous space instead, so the ellipsis always lands after
 * a whole word.
 *
 * Edge cases this is built to survive without producing garbage:
 * - Text no longer than `max` is returned untouched — there is nothing to
 *   truncate, so no ellipsis is added.
 * - A `max` that lands exactly on a space between two words still finds
 *   that space as `cut`'s own last character boundary was never crossed
 *   mid-word, so the walk-back is a no-op and the whole leading word survives.
 * - A single word longer than `max` has no earlier space to walk back to —
 *   `lastIndexOf(' ')` returns `-1` — so the raw character cut is kept
 *   rather than collapsing to an empty string.
 */
export function truncateWords(text: string, max: number): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}
