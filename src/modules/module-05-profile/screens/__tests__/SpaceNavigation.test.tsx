/*
 * `require`, declared locally, rather than `import fs from 'node:fs'`.
 *
 * This project has no `@types/node` and its tsconfig lists only `jest` in
 * `types`, so a node import does not typecheck. Adding the dependency to make
 * one test compile is a bigger change than the test is worth — this file is
 * the only thing in `src/` that touches the filesystem. Jest runs in node, so
 * the call itself is fine; only the types were missing.
 */
declare const require: (id: string) => any

type Dirent = { name: string; isDirectory: () => boolean }
const fs = require('fs') as {
  readdirSync: ((p: string) => string[]) &
    ((p: string, o: { withFileTypes: true }) => Dirent[])
  readFileSync: (p: string, enc: string) => string
}
const path = require('path') as { join: (...parts: string[]) => string }

/**
 * Every Space screen has to be reachable from another one.
 *
 * This suite exists because seventeen screens were built and eleven of them
 * could not be opened on a device — the route files' own "REACHED FROM"
 * comments described links that were never written. Typecheck and unit tests
 * were all green, because an unreachable screen is not a broken screen; it is
 * a screen nothing points at, and nothing in the suite was looking.
 *
 * It reads the source rather than rendering anything, so it fails the moment a
 * new route lands without a way in.
 */
const ROUTES_DIR = path.join(process.cwd(), 'src', 'app', '(app)', 'space')
const SOURCE_DIRS = [
  path.join(process.cwd(), 'src', 'modules'),
  path.join(process.cwd(), 'src', 'design-system'),
  // `src/copy` counts: `SPACE_MORE_LINKS` holds hrefs as data, and a link
  // declared there is every bit as real as one written inline in a screen.
  path.join(process.cwd(), 'src', 'copy'),
]

/**
 * Reached by the tab bar or rendered by another screen rather than pushed, so
 * no `router.push` names them. Each needs a reason, or the exception list
 * becomes a way to silence this test.
 */
const NOT_PUSHED: Record<string, string> = {
  index: 'the Space tab itself — BottomNav routes to it, not a push',
  welcome: 'rendered by `/space` when the space has no name; addressable for review only',
  'identity-refined': "the board's alternate take on Our Identity, kept for comparison",
}

function collectFiles(dir: string): string[] {
  const out: string[] = []

  for (const entry of fs.readdirSync(dir, { withFileTypes: true }) as Dirent[]) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...collectFiles(full))
    else if (full.endsWith('.tsx') || full.endsWith('.ts')) out.push(full)
  }

  return out
}

describe('Space navigation', () => {
  const routes = fs
    .readdirSync(ROUTES_DIR)
    .filter((f: string) => f.endsWith('.tsx'))
    .map((f: string) => f.replace(/\.tsx$/, ''))

  const source = SOURCE_DIRS.flatMap(collectFiles)
    .filter((f: string) => !f.includes('__tests__'))
    .map((f: string) => fs.readFileSync(f, 'utf8'))
    .join('\n')

  it('has routes to find', () => {
    expect(routes.length).toBeGreaterThan(10)
  })

  it.each(routes.filter((r: string) => !(r in NOT_PUSHED)))(
    '/space/%s is linked from somewhere',
    (route) => {
      expect(source).toContain(`/(app)/space/${route}`)
    },
  )

  /*
   * A Back control has to go somewhere even when the screen was opened
   * directly — a pasted URL, a browser reload, a deep link. Bare
   * `router.back()` is a dead control there, and expo-router logs
   *   "The action 'GO_BACK' was not handled by any navigator".
   * `useBackTo(fallback)` keeps the ordinary pop and gives that case a real
   * destination. Every Space screen with a back arrow must use it.
   */
  it('gives every Space screen a Back that always goes somewhere', () => {
    const SCREENS = path.join(process.cwd(), 'src', 'modules', 'module-05-profile', 'screens')
    const offenders: string[] = []

    for (const file of fs.readdirSync(SCREENS) as string[]) {
      if (!file.endsWith('.tsx')) continue

      const src = fs.readFileSync(path.join(SCREENS, file), 'utf8')
      // Only the Space cluster is in scope; the older settings screens predate
      // this rule and are tracked separately.
      if (!/activeTab="space"|SPACE_[A-Z_]+_COPY/.test(src)) continue
      if (src.includes('router.back()')) offenders.push(file)
    }

    expect(offenders).toEqual([])
  })

  it('documents why each unlinked route is unlinked', () => {
    for (const [route, reason] of Object.entries(NOT_PUSHED)) {
      expect(routes).toContain(route)
      expect(reason.length).toBeGreaterThan(20)
    }
  })
})
