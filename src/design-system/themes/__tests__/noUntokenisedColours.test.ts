/**
 * `@types/node` is not installed, and this is the only file in the app that
 * needs the filesystem. One declaration here beats a type-only dependency for
 * one test; the shape is the union of the two modules it loads.
 */
declare const __dirname: string
declare const require: (id: string) => {
  readdirSync(p: string, o: { withFileTypes: true }): { name: string; isDirectory(): boolean }[]
  readFileSync(p: string, e: 'utf8'): string
  join(...parts: string[]): string
}

const { readdirSync, readFileSync } = require('fs')
const { join } = require('path')

const SRC = join(__dirname, '..', '..', '..')

/**
 * Where a raw colour is allowed to live.
 *
 * `tokens/` is the source of truth and `themes/` assembles it — between them
 * they are the only files a hex belongs in. `test/` holds the contrast helper
 * and the rejected-value assertions, which have to name hexes to pin them.
 */
const ALLOWED_DIRS = ['design-system/tokens/', 'design-system/themes/', 'test/', '__tests__/']

/**
 * Colours that are deliberately NOT theme tokens, with the reason.
 *
 * An enumerated list and not a blanket rule: a new hardcoded colour anywhere
 * still fails, which is the entire value of this test. Adding an entry should
 * feel like a decision, because it is one.
 */
const DELIBERATE: Record<string, { colour: string; why: string }[]> = {
  'design-system/patterns/PhotoLightbox.tsx': [
    {
      colour: 'rgba(0, 0, 0, 0.93)',
      why:
        "The photo viewer's ground. Black in a light theme and a dark one alike, " +
        'so it is not a per-theme value — see that file\'s own note on why ' +
        '`surface.scrim` at 45% could not be reused for it.',
    },
  ],
}

/** Strips block and line comments. Neither renders, so neither counts. */
function code(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)

    if (entry.isDirectory()) walk(full, out)
    else if (/\.tsx?$/.test(entry.name)) out.push(full)
  }

  return out
}

const files = walk(SRC)
  .map((full) => full.slice(SRC.length + 1).split('\\').join('/'))
  .filter((rel) => !ALLOWED_DIRS.some((dir) => rel.startsWith(dir) || rel.includes(dir)))

/**
 * THE STATIC HALF of dark-mode coverage.
 *
 * `theme.applied` proves that what gets RENDERED comes from the theme — but only
 * for components something renders. This proves it across every source file,
 * including the ones no test mounts yet, which is exactly where a hardcoded
 * colour sits unnoticed until somebody opens the app in dark mode.
 *
 * It is the mechanised form of the rule already written at the top of
 * `tokens/colors.ts`: "nothing outside `themes/` imports this file. Screens and
 * components read semantic names off the theme, never a raw hex."
 */
describe('no untokenised colours', () => {
  it('finds source files to check', () => {
    // Guards the walk itself — a broken path would make every assertion below
    // pass by looking at nothing at all.
    expect(files.length).toBeGreaterThan(50)
  })

  it.each(files)('%s names no colour of its own', (rel) => {
    const body = code(readFileSync(join(SRC, rel), 'utf8'))

    const found = [
      ...(body.match(/#[0-9A-Fa-f]{3,8}\b/g) ?? []),
      ...(body.match(/\brgba?\s*\([^)]*\)/g) ?? []),
    ]

    const excused = (DELIBERATE[rel] ?? []).map((entry) => entry.colour)

    // A colour written here is a colour no theme can repaint. Move it into
    // `tokens/colors.ts`, give it a semantic name in `themes/theme.ts`, and add
    // the dark value in the same commit — which is the point of failing here.
    expect(found.filter((colour) => !excused.includes(colour))).toEqual([])
  })

  it('keeps the deliberate list honest', () => {
    // An excused colour that is no longer in the file it was excused for means
    // the list has gone stale, and a stale entry is a hole in the check.
    for (const [rel, entries] of Object.entries(DELIBERATE)) {
      const body = code(readFileSync(join(SRC, rel), 'utf8'))

      for (const entry of entries) {
        expect(entry.why.length).toBeGreaterThan(20)
        expect(body).toContain(entry.colour)
      }
    }
  })
})
