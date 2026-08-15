/**
 * Copy for M01-S11 Our Story Begins. Figma 522:834.
 *
 * Both exits lead to Cluster 3, which does not exist yet. Rather than wire them
 * to a route that would throw, the screen says so plainly — `endOfFlowNote` and
 * the disabled actions both go when Cluster 3 lands (spec §8).
 */
export const OUR_STORY_BEGINS_COPY = {
  heading: "Now, let's begin your story. ❤️",
  lede: 'Add the moments that matter and watch your timeline fill up.',
  begin: "Let's Begin",
  skip: 'Skip for now',
  endOfFlowNote: 'This is the end of the flow built so far.',
} as const
