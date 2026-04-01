// Stub for https://edge.netlify.com used only as a type import in edge functions.
// At runtime (Deno edge environment) this is provided by the Netlify Edge Runtime.
// In Vitest (Node) the handler imports `Context` as a type-only import, so this
// stub just needs to satisfy the TypeScript compiler / module resolver.

export interface Context {
  next: (options?: { sendConditionalRequest?: boolean }) => Promise<Response>
  ip: string
  requestId: string
  account: { id: string }
  site: { id: string; name: string; url: string }
  deploy: { id: string; published: boolean }
  geo: {
    city?: string
    country?: { code?: string; name?: string }
    subdivision?: { code?: string; name?: string }
    latitude?: number
    longitude?: number
    timezone?: string
  }
  cookies: {
    get: (name: string) => string | undefined
    set: (name: string, value: string, options?: object) => void
    delete: (name: string, options?: object) => void
  }
  log: (...args: unknown[]) => void
  rewrite: (url: string) => Response
  json: (data: unknown, init?: ResponseInit) => Response
}