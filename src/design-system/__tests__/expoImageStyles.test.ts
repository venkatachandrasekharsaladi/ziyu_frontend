/**
 * `@types/node` is not installed. One declaration beats a type-only dependency
 * for the two test files in this repo that walk the filesystem.
 */
declare const __dirname: string
declare const require: (id: string) => {
  readdirSync(p: string, o: { withFileTypes: true }): { name: string; isDirectory(): boolean }[]
  readFileSync(p: string, e: 'utf8'): string
  join(...parts: string[]): string
}

const { readdirSync, readFileSync } = require('fs')
const { join } = require('path')

const SRC = join(__dirname, '..', '..')

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)

    if (entry.isDirectory()) walk(full, out)
    else if (/\.tsx?$/.test(entry.name)) out.push(full)
  }

  return out
}

/** Every `<Image ... >` opening tag in a source file, as raw text. */
function imageTags(source: string): string[] {
  const tags: string[] = []
  let from = source.indexOf('<Image')

  while (from !== -1) {
    // The opening tag ends at the first `>`; JSX expressions inside it can
    // contain `>` only within braces, and none of these tags do.
    const end = source.indexOf('>', from)

    tags.push(source.slice(from, end === -1 ? source.length : end))
    from = source.indexOf('<Image', from + 1)
  }

  return tags
}

const consumers = walk(SRC)
  .filter((full) => readFileSync(full, 'utf8').includes("from 'expo-image'"))
  .map((full) => [full.slice(SRC.length + 1).split('\\').join('/'), full] as const)

/**
 * UNISTYLES STYLES DO NOT REACH EXPO-IMAGE.
 *
 * Unistyles binds its styles to the native shadow node and does not process
 * expo-image, so a `StyleSheet.create` entry handed to `<Image>` arrives with
 * its properties stripped. `width`/`height` going missing is the loud version —
 * the image draws 0×0 — and it is silent in the logs: the layout around it keeps
 * whatever shape its parent gives it, so all you see is a hole.
 *
 * This was fixed once across six components and missed in three, including the
 * Welcome hero, where it left a hero-sized gap for weeks. A comment in each
 * file was not enough to stop it recurring; this is.
 *
 * The rule: an `expo-image` `<Image>` takes a PLAIN object literal, or a plain
 * const built in the component. Never `styles.x` from `StyleSheet.create`.
 */
describe('expo-image never receives a Unistyles style', () => {
  it('finds the components that render expo-image', () => {
    // Guards the walk — a broken path would make the assertion below vacuous.
    expect(consumers.length).toBeGreaterThan(5)
  })

  it.each(consumers)('%s passes plain styles to <Image>', (_rel, full) => {
    const source = readFileSync(full, 'utf8')

    const offenders = imageTags(source).filter((tag) => /style=\{\[?\s*styles\./.test(tag))

    // Replace `styles.foo` with a plain object literal, or a module-level
    // `as const` if it has no theme dependency. Keep the surrounding View on
    // Unistyles — the restriction is expo-image's, not React Native's.
    expect(offenders).toEqual([])
  })
})
