import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { HandlerEvent } from '@netlify/functions'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a minimal HandlerEvent fixture.  Only the fields actually read by
 * the handler are populated; every other field is left as an empty-string
 * sentinel so TypeScript remains happy without the full Netlify type.
 */
function makeEvent(
  overrides: Partial<HandlerEvent> & {
    headers?: Record<string, string>
    body?: string | null
    httpMethod?: string
  } = {}
): HandlerEvent {
  return {
    httpMethod: overrides.httpMethod ?? 'POST',
    headers: overrides.headers ?? {},
    body: overrides.body !== undefined ? overrides.body : '{}',
    rawUrl: '',
    rawQuery: '',
    path: '/.netlify/functions/subscribe',
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    isBase64Encoded: false,
    ...overrides,
  } as HandlerEvent
}

/**
 * Build a successful ConvertKit API response body.
 */
function ckSuccessBody(id = 12345) {
  return JSON.stringify({ subscription: { id } })
}

// ---------------------------------------------------------------------------
// Module-level setup
// ---------------------------------------------------------------------------

// We set required env vars before importing the handler so the module sees them
// during initialisation (e.g. if there were any top-level side effects).
const ENV_DEFAULTS = {
  CONVERTKIT_API_KEY: 'test-api-key',
  CONVERTKIT_FORM_ID: 'test-form-id',
  CONVERTKIT_TAG_ID: '',
  ALLOWED_ORIGIN: 'https://paperlyte.com',
}

// Apply env vars before each test
beforeEach(() => {
  Object.assign(process.env, ENV_DEFAULTS)
})

afterEach(() => {
  // Clean up env vars
  for (const key of Object.keys(ENV_DEFAULTS)) {
    delete process.env[key]
  }
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// Import the handler.  We import after environment setup.
// ---------------------------------------------------------------------------
// Dynamic import inside each test is impractical because the rate-limit store
// is module-level state.  Instead we use unique client IPs per test so that
// the shared store never trips the 3-req/min limit for a single test.
let ipCounter = 0
function uniqueIp(): string {
  return `10.0.${Math.floor(++ipCounter / 255)}.${ipCounter % 255}`
}

let handler: (typeof import('./subscribe'))['handler']

beforeEach(async () => {
  // Re-use a single import for performance; unique IPs isolate rate-limit state.
  if (!handler) {
    const mod = await import('./subscribe')
    handler = mod.handler
  }
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('subscribe handler', () => {
  // -------------------------------------------------------------------------
  // HTTP Method handling
  // -------------------------------------------------------------------------
  describe('HTTP method handling', () => {
    it('returns 204 for OPTIONS preflight requests', async () => {
      const result = await handler(makeEvent({ httpMethod: 'OPTIONS' }), {} as never, {} as never)
      expect(result!.statusCode).toBe(204)
      expect(result!.body).toBe('')
    })

    it('returns 405 for GET requests', async () => {
      const result = await handler(makeEvent({ httpMethod: 'GET' }), {} as never, {} as never)
      expect(result!.statusCode).toBe(405)
      const body = JSON.parse(result!.body!)
      expect(body.error).toBe('Method not allowed')
    })

    it('returns 405 for PUT requests', async () => {
      const result = await handler(makeEvent({ httpMethod: 'PUT' }), {} as never, {} as never)
      expect(result!.statusCode).toBe(405)
    })

    it('returns 405 for DELETE requests', async () => {
      const result = await handler(makeEvent({ httpMethod: 'DELETE' }), {} as never, {} as never)
      expect(result!.statusCode).toBe(405)
    })
  })

  // -------------------------------------------------------------------------
  // CORS header behaviour
  // -------------------------------------------------------------------------
  describe('CORS headers', () => {
    it('includes Access-Control-Allow-Origin for allowed origin', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(ckSuccessBody(), { status: 200 })
      )

      const result = await handler(
        makeEvent({
          headers: {
            origin: 'https://paperlyte.com',
            'x-forwarded-for': uniqueIp(),
          },
          body: JSON.stringify({ email: 'test@example.com' }),
        }),
        {} as never,
        {} as never
      )

      expect(result!.headers!['Access-Control-Allow-Origin']).toBe('https://paperlyte.com')
    })

    it('omits Access-Control-Allow-Origin for disallowed origin', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(ckSuccessBody(), { status: 200 })
      )

      const result = await handler(
        makeEvent({
          headers: {
            origin: 'https://evil.com',
            'x-forwarded-for': uniqueIp(),
          },
          body: JSON.stringify({ email: 'test@example.com' }),
        }),
        {} as never,
        {} as never
      )

      expect(result!.headers!['Access-Control-Allow-Origin']).toBeUndefined()
    })

    it('always includes Content-Type: application/json', async () => {
      const result = await handler(makeEvent({ httpMethod: 'OPTIONS' }), {} as never, {} as never)
      expect(result!.headers!['Content-Type']).toBe('application/json')
    })

    it('includes CORS headers on OPTIONS preflight regardless of origin', async () => {
      const result = await handler(
        makeEvent({
          httpMethod: 'OPTIONS',
          headers: { origin: 'https://other.com' },
        }),
        {} as never,
        {} as never
      )

      expect(result!.statusCode).toBe(204)
      expect(result!.headers!['Access-Control-Allow-Methods']).toBe('POST, OPTIONS')
      expect(result!.headers!['Access-Control-Allow-Headers']).toBe('Content-Type')
    })
  })

  // -------------------------------------------------------------------------
  // Rate limiting
  // -------------------------------------------------------------------------
  describe('rate limiting', () => {
    it('returns 429 after exceeding request limit for same IP', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(ckSuccessBody(), { status: 200 })
      )

      const ip = uniqueIp()
      const makeRateLimitedEvent = () =>
        makeEvent({
          headers: { 'x-forwarded-for': ip },
          body: JSON.stringify({ email: 'test@example.com' }),
        })

      // First 3 requests should succeed (rate limit is 3/min)
      await handler(makeRateLimitedEvent(), {} as never, {} as never)
      await handler(makeRateLimitedEvent(), {} as never, {} as never)
      await handler(makeRateLimitedEvent(), {} as never, {} as never)

      // 4th request should be rate-limited
      const result = await handler(makeRateLimitedEvent(), {} as never, {} as never)
      expect(result!.statusCode).toBe(429)
      const body = JSON.parse(result!.body!)
      expect(body.error).toMatch(/too many requests/i)
    })

    it('uses x-forwarded-for header for IP identification', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(ckSuccessBody(), { status: 200 })
      )

      const ip = uniqueIp()
      const result = await handler(
        makeEvent({
          headers: { 'x-forwarded-for': `${ip}, 10.0.0.1` },
          body: JSON.stringify({ email: 'test@example.com' }),
        }),
        {} as never,
        {} as never
      )

      // Should succeed (first request for this IP)
      expect(result!.statusCode).toBe(200)
    })

    it('uses client-ip header as fallback when x-forwarded-for is absent', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(ckSuccessBody(), { status: 200 })
      )

      const result = await handler(
        makeEvent({
          headers: { 'client-ip': uniqueIp() },
          body: JSON.stringify({ email: 'test@example.com' }),
        }),
        {} as never,
        {} as never
      )

      expect(result!.statusCode).toBe(200)
    })
  })

  // -------------------------------------------------------------------------
  // Request body parsing
  // -------------------------------------------------------------------------
  describe('request body parsing', () => {
    it('returns 400 for malformed JSON body', async () => {
      const result = await handler(
        makeEvent({
          headers: { 'x-forwarded-for': uniqueIp() },
          body: 'not-valid-json{{{',
        }),
        {} as never,
        {} as never
      )

      expect(result!.statusCode).toBe(400)
      const body = JSON.parse(result!.body!)
      expect(body.error).toBe('Invalid request body')
    })

    it('handles null body by treating it as empty object', async () => {
      const result = await handler(
        makeEvent({
          headers: { 'x-forwarded-for': uniqueIp() },
          body: null,
        }),
        {} as never,
        {} as never
      )

      // Null body → parsed as {} → missing email → 400
      expect(result!.statusCode).toBe(400)
      const body = JSON.parse(result!.body!)
      expect(body.error).toBe('Email is required')
    })
  })

  // -------------------------------------------------------------------------
  // Email validation
  // -------------------------------------------------------------------------
  describe('email validation', () => {
    it('returns 400 when email field is missing', async () => {
      const result = await handler(
        makeEvent({
          headers: { 'x-forwarded-for': uniqueIp() },
          body: JSON.stringify({}),
        }),
        {} as never,
        {} as never
      )

      expect(result!.statusCode).toBe(400)
      const body = JSON.parse(result!.body!)
      expect(body.error).toBe('Email is required')
    })

    it('returns 400 when email is an empty string', async () => {
      const result = await handler(
        makeEvent({
          headers: { 'x-forwarded-for': uniqueIp() },
          body: JSON.stringify({ email: '' }),
        }),
        {} as never,
        {} as never
      )

      expect(result!.statusCode).toBe(400)
      const body = JSON.parse(result!.body!)
      expect(body.error).toBe('Email is required')
    })

    it('returns 400 with "Invalid email address" for malformed email', async () => {
      const result = await handler(
        makeEvent({
          headers: { 'x-forwarded-for': uniqueIp() },
          body: JSON.stringify({ email: 'not-an-email' }),
        }),
        {} as never,
        {} as never
      )

      expect(result!.statusCode).toBe(400)
      const body = JSON.parse(result!.body!)
      // The PR changed validateEmail → isValidEmail; error is now always this fixed string
      expect(body.error).toBe('Invalid email address')
    })

    it('returns 400 with "Invalid email address" for email missing TLD', async () => {
      const result = await handler(
        makeEvent({
          headers: { 'x-forwarded-for': uniqueIp() },
          body: JSON.stringify({ email: 'user@nodot' }),
        }),
        {} as never,
        {} as never
      )

      expect(result!.statusCode).toBe(400)
      expect(JSON.parse(result!.body!).error).toBe('Invalid email address')
    })

    it('returns 400 with "Invalid email address" for email with only spaces', async () => {
      const result = await handler(
        makeEvent({
          headers: { 'x-forwarded-for': uniqueIp() },
          body: JSON.stringify({ email: '   ' }),
        }),
        {} as never,
        {} as never
      )

      expect(result!.statusCode).toBe(400)
      expect(JSON.parse(result!.body!).error).toBe('Invalid email address')
    })

    it('does not expose specific validation errors (uses generic "Invalid email address")', async () => {
      const result = await handler(
        makeEvent({
          headers: { 'x-forwarded-for': uniqueIp() },
          body: JSON.stringify({ email: 'bad@' }),
        }),
        {} as never,
        {} as never
      )

      expect(result!.statusCode).toBe(400)
      const body = JSON.parse(result!.body!)
      // The generic message prevents leaking internal validation details
      expect(body.error).toBe('Invalid email address')
      expect(body).not.toHaveProperty('details')
    })

    it('normalises email to lowercase before validation', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(ckSuccessBody(), { status: 200 })
      )

      const result = await handler(
        makeEvent({
          headers: { 'x-forwarded-for': uniqueIp() },
          body: JSON.stringify({ email: '  TEST@EXAMPLE.COM  ' }),
        }),
        {} as never,
        {} as never
      )

      // Normalised email is valid — should proceed to subscribe
      expect(result!.statusCode).toBe(200)
    })

    it('accepts valid email and proceeds to subscribe step', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(ckSuccessBody(99), { status: 200 })
      )

      const result = await handler(
        makeEvent({
          headers: { 'x-forwarded-for': uniqueIp() },
          body: JSON.stringify({ email: 'valid@example.com' }),
        }),
        {} as never,
        {} as never
      )

      expect(result!.statusCode).toBe(200)
      const body = JSON.parse(result!.body!)
      expect(body.success).toBe(true)
      expect(body.subscriptionId).toBe(99)
    })
  })

  // -------------------------------------------------------------------------
  // Successful subscription
  // -------------------------------------------------------------------------
  describe('successful subscription', () => {
    it('returns 200 with success message and subscriptionId', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(ckSuccessBody(42), { status: 200 })
      )

      const result = await handler(
        makeEvent({
          headers: { 'x-forwarded-for': uniqueIp() },
          body: JSON.stringify({ email: 'user@example.com' }),
        }),
        {} as never,
        {} as never
      )

      expect(result!.statusCode).toBe(200)
      const body = JSON.parse(result!.body!)
      expect(body.success).toBe(true)
      expect(body.subscriptionId).toBe(42)
      expect(body.message).toMatch(/subscribed/i)
    })

    it('calls the ConvertKit API with correct form URL', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(ckSuccessBody(), { status: 200 })
      )

      await handler(
        makeEvent({
          headers: { 'x-forwarded-for': uniqueIp() },
          body: JSON.stringify({ email: 'user@example.com' }),
        }),
        {} as never,
        {} as never
      )

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('api.convertkit.com/v3/forms/test-form-id/subscribe'),
        expect.objectContaining({ method: 'POST' })
      )
    })

    it('includes api_key in ConvertKit request body', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(ckSuccessBody(), { status: 200 })
      )

      await handler(
        makeEvent({
          headers: { 'x-forwarded-for': uniqueIp() },
          body: JSON.stringify({ email: 'user@example.com' }),
        }),
        {} as never,
        {} as never
      )

      const callBody = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string)
      expect(callBody.api_key).toBe('test-api-key')
      expect(callBody.email).toBe('user@example.com')
    })

    it('includes tags when CONVERTKIT_TAG_ID is set', async () => {
      process.env.CONVERTKIT_TAG_ID = 'tag-123'
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(ckSuccessBody(), { status: 200 })
      )

      await handler(
        makeEvent({
          headers: { 'x-forwarded-for': uniqueIp() },
          body: JSON.stringify({ email: 'user@example.com' }),
        }),
        {} as never,
        {} as never
      )

      const callBody = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string)
      expect(callBody.tags).toEqual(['tag-123'])
    })

    it('omits tags field when CONVERTKIT_TAG_ID is not set', async () => {
      delete process.env.CONVERTKIT_TAG_ID
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(ckSuccessBody(), { status: 200 })
      )

      await handler(
        makeEvent({
          headers: { 'x-forwarded-for': uniqueIp() },
          body: JSON.stringify({ email: 'user@example.com' }),
        }),
        {} as never,
        {} as never
      )

      const callBody = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string)
      expect(callBody).not.toHaveProperty('tags')
    })
  })

  // -------------------------------------------------------------------------
  // ConvertKit credential validation
  // -------------------------------------------------------------------------
  describe('ConvertKit credentials', () => {
    it('returns 500 when CONVERTKIT_API_KEY is missing', async () => {
      delete process.env.CONVERTKIT_API_KEY

      const result = await handler(
        makeEvent({
          headers: { 'x-forwarded-for': uniqueIp() },
          body: JSON.stringify({ email: 'user@example.com' }),
        }),
        {} as never,
        {} as never
      )

      expect(result!.statusCode).toBe(500)
      const body = JSON.parse(result!.body!)
      expect(body.error).toMatch(/failed to process subscription/i)
    })

    it('returns 500 when CONVERTKIT_FORM_ID is missing', async () => {
      delete process.env.CONVERTKIT_FORM_ID

      const result = await handler(
        makeEvent({
          headers: { 'x-forwarded-for': uniqueIp() },
          body: JSON.stringify({ email: 'user@example.com' }),
        }),
        {} as never,
        {} as never
      )

      expect(result!.statusCode).toBe(500)
      expect(JSON.parse(result!.body!).error).toMatch(/failed to process subscription/i)
    })
  })

  // -------------------------------------------------------------------------
  // ConvertKit API error handling
  // -------------------------------------------------------------------------
  describe('ConvertKit API errors', () => {
    it('returns 500 when ConvertKit API returns a non-OK response', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      )

      const result = await handler(
        makeEvent({
          headers: { 'x-forwarded-for': uniqueIp() },
          body: JSON.stringify({ email: 'user@example.com' }),
        }),
        {} as never,
        {} as never
      )

      expect(result!.statusCode).toBe(500)
      // Should NOT expose internal API error details
      const body = JSON.parse(result!.body!)
      expect(body.error).toMatch(/failed to process subscription/i)
      expect(body.error).not.toMatch(/unauthorized/i)
    })

    it('returns 500 when ConvertKit API returns invalid JSON', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response('not-json-!@#', { status: 200 })
      )

      const result = await handler(
        makeEvent({
          headers: { 'x-forwarded-for': uniqueIp() },
          body: JSON.stringify({ email: 'user@example.com' }),
        }),
        {} as never,
        {} as never
      )

      expect(result!.statusCode).toBe(500)
    })

    it('returns 500 when ConvertKit response does not match expected schema', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ unexpected: 'shape' }), { status: 200 })
      )

      const result = await handler(
        makeEvent({
          headers: { 'x-forwarded-for': uniqueIp() },
          body: JSON.stringify({ email: 'user@example.com' }),
        }),
        {} as never,
        {} as never
      )

      expect(result!.statusCode).toBe(500)
    })

    it('returns 500 when fetch throws a network error', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new TypeError('Network error'))

      const result = await handler(
        makeEvent({
          headers: { 'x-forwarded-for': uniqueIp() },
          body: JSON.stringify({ email: 'user@example.com' }),
        }),
        {} as never,
        {} as never
      )

      expect(result!.statusCode).toBe(500)
      const body = JSON.parse(result!.body!)
      // Must not leak internal error messages
      expect(body.error).toMatch(/failed to process subscription/i)
    })

    it('does not expose internal error details in 500 response', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Some sensitive internal detail'))

      const result = await handler(
        makeEvent({
          headers: { 'x-forwarded-for': uniqueIp() },
          body: JSON.stringify({ email: 'user@example.com' }),
        }),
        {} as never,
        {} as never
      )

      expect(result!.statusCode).toBe(500)
      const body = JSON.parse(result!.body!)
      expect(body.error).not.toContain('sensitive internal detail')
    })
  })
})