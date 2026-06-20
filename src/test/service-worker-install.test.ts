import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'

interface ServiceWorkerHarness {
  install: (event: { waitUntil: (promise: Promise<unknown>) => void }) => void
  skipWaiting: ReturnType<typeof vi.fn>
  waitUntil: ReturnType<typeof vi.fn>
}

function createHarness(hasActiveWorker: boolean): ServiceWorkerHarness {
  const listeners = new Map<string, (event: never) => void>()
  const skipWaiting = vi.fn(() => Promise.resolve())
  const waitUntil = vi.fn()
  const cache = { addAll: vi.fn(() => Promise.resolve()) }

  const self = {
    registration: { active: hasActiveWorker ? {} : null },
    location: { origin: 'https://paperlyte.example' },
    clients: { claim: vi.fn(() => Promise.resolve()) },
    skipWaiting,
    addEventListener: vi.fn((type: string, listener: (event: never) => void) => {
      listeners.set(type, listener)
    }),
  }

  runInNewContext(readFileSync('public/sw.js', 'utf8'), {
    URL,
    caches: {
      open: vi.fn(() => Promise.resolve(cache)),
      keys: vi.fn(() => Promise.resolve([])),
      delete: vi.fn(() => Promise.resolve(true)),
      match: vi.fn(() => Promise.resolve(undefined)),
    },
    fetch: vi.fn(),
    self,
  })

  const install = listeners.get('install')
  if (!install) throw new Error('Service worker did not register an install listener')

  return {
    install,
    skipWaiting,
    waitUntil,
  }
}

describe('service worker installation', () => {
  it('skips waiting on an initial installation', async () => {
    const harness = createHarness(false)

    harness.install({ waitUntil: harness.waitUntil })
    await harness.waitUntil.mock.calls[0][0]

    expect(harness.skipWaiting).toHaveBeenCalledOnce()
  })

  it('keeps an update waiting while an active worker controls the app', async () => {
    const harness = createHarness(true)

    harness.install({ waitUntil: harness.waitUntil })
    await harness.waitUntil.mock.calls[0][0]

    expect(harness.skipWaiting).not.toHaveBeenCalled()
  })
})
