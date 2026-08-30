/**
 * Reads the Chat frames out of the Ziyu Figma file and writes the design-parity
 * fixture that `module-03-chat/__tests__/DesignParity.test.tsx` asserts against.
 *
 * Run: FIGMA_TOKEN=figd_... node scripts/sync-figma-chat.mjs
 *
 * WHY a committed fixture rather than calling the API from the test: a test that
 * hits the network is a test that fails when the network does, and it would need
 * a credential in CI. Committing the fixture makes a design change show up as a
 * reviewable DIFF in a pull request instead of a surprise red build — someone has
 * to look at what moved and say yes to it.
 *
 * The token is read from the environment and never written to this file or the
 * fixture. Nothing here is secret; the fixture is public design metadata.
 */
import { writeFileSync, mkdirSync } from 'node:fs'

const TOKEN = process.env.FIGMA_TOKEN
const FILE = 'BDMFuyYb2I2ZMmaEz5gBAZ'
const CHAT = '3390:3'
const OUT_DIR = 'src/modules/module-03-chat/__fixtures__'
const OUT = `${OUT_DIR}/figma-chat.json`

if (!TOKEN) {
  console.error('Set FIGMA_TOKEN in the environment. See the header comment.')
  process.exit(1)
}

const hex = (c) =>
  '#' +
  [c.r, c.g, c.b]
    .map((v) => Math.round(v * 255).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()

const res = await fetch(`https://api.figma.com/v1/files/${FILE}/nodes?ids=${CHAT}`, {
  headers: { 'X-Figma-Token': TOKEN },
})

if (!res.ok) {
  console.error(`Figma API returned ${res.status}. Check the token and the file key.`)
  process.exit(1)
}

const payload = await res.json()
const chat = payload.nodes[CHAT]?.document

if (!chat) {
  console.error(`Node ${CHAT} not found in file ${FILE}.`)
  process.exit(1)
}

/**
 * Collects only what a test can meaningfully assert: the strings a frame draws,
 * their type ramp, and the shape values. Positions are deliberately NOT captured
 * — asserting absolute coordinates against a flex layout produces a fixture that
 * fails on every reflow while catching nothing real.
 */
const walk = (node, into) => {
  if (node.type === 'TEXT') {
    into.text.push({
      id: node.id,
      characters: node.characters,
      fontSize: node.style?.fontSize ?? null,
      fontWeight: node.style?.fontWeight ?? null,
      color: node.fills?.[0]?.color ? hex(node.fills[0].color) : null,
    })
  }
  if (typeof node.cornerRadius === 'number') into.radii.push(node.cornerRadius)
  if (typeof node.itemSpacing === 'number') into.gaps.push(node.itemSpacing)
  for (const child of node.children ?? []) walk(child, into)
}

const frames = {}

for (const frame of (chat.children ?? []).filter((c) => c.type === 'FRAME')) {
  const into = { name: frame.name, text: [], radii: [], gaps: [] }
  walk(frame, into)
  into.radii = [...new Set(into.radii)].sort((a, b) => a - b)
  into.gaps = [...new Set(into.gaps)].sort((a, b) => a - b)
  into.width = Math.round(frame.absoluteBoundingBox.width)
  into.height = Math.round(frame.absoluteBoundingBox.height)
  frames[frame.id] = into
}

mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(OUT, JSON.stringify({ file: FILE, node: CHAT, frames }, null, 2) + '\n')

console.log(`Wrote ${Object.keys(frames).length} frames to ${OUT}.`)
