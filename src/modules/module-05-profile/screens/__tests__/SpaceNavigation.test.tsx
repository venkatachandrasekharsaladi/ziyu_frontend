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

  it('documents why each unlinked route is unlinked', () => {
    for (const [route, reason] of Object.entries(NOT_PUSHED)) {
      expect(routes).toContain(route)
      expect(reason.length).toBeGreaterThan(20)
    }
  })
})
