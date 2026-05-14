'use strict'

// Bump this string on each deploy that changes pre-cached assets; onActivate
// deletes all caches whose name differs from this value.
const CACHE_VERSION = 'paperlyte-v1'
const OFFLINE_PAGE = '/offline.html'

// Pre-cache these on install so offline fallback is always available
const PRECACHE = [
  '/',
  OFFLINE_PAGE,
  '/offline.css',
  '/offline.js',
  '/site.webmanifest',
  '/fonts/Inter-Variable.woff2',
  '/fonts/PlayfairDisplay-Variable.woff2',
]

// Vite-hashed assets (content-addressed, immutable) → cache-first
const HASHED_ASSET_RE = /^\/assets\/.+\.(js|css|woff2?)$/

// Root-level offline support files (pre-cached, not content-hashed) → cache-first
const OFFLINE_ASSET_RE = /^\/(offline\.css|offline\.js)$/

// Other cacheable static files (images, icons, fonts) → stale-while-revalidate
const CACHEABLE_RE = /\.(png|jpg|jpeg|webp|avif|svg|ico|woff2?)$/

// ─── Lifecycle ───────────────────────────────────────────────────────────────

/**
 * Pre-cache critical assets so the offline fallback is available from the first visit.
 * Does NOT call skipWaiting() — the new SW waits until all tabs on the old version
 * are closed before activating, preventing open tabs from losing their cached assets.
 * @param {ExtendableEvent} event
 */
function onInstall(event) {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE)))
}

/**
 * Delete all caches that don't match the current CACHE_VERSION, then claim existing
 * clients so they are controlled by this SW without requiring a page reload.
 * @param {ExtendableEvent} event
 */
function onActivate(event) {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  )
}

// ─── Fetch routing ───────────────────────────────────────────────────────────

/**
 * Route same-origin GET requests to the appropriate caching strategy.
 * Non-GET and cross-origin requests are ignored (browser handles them normally).
 * @param {FetchEvent} event
 */
function onFetch(event) {
  const { request } = event
  const url = new URL(request.url)

  // Only intercept same-origin GET requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  const path = url.pathname

  if (HASHED_ASSET_RE.test(path) || OFFLINE_ASSET_RE.test(path)) {
    // Content-hashed Vite bundles and pre-cached offline support files: serve from
    // cache immediately, populate on miss
    event.respondWith(cacheFirst(request))
  } else if (request.mode === 'navigate') {
    // HTML navigation: try network, fall back to app shell, then offline page
    event.respondWith(navigateFetch(request))
  } else if (CACHEABLE_RE.test(path)) {
    // Images, fonts, icons: serve stale immediately, refresh in background
    event.respondWith(staleWhileRevalidate(request))
  }
  // Everything else: let the browser handle normally (no respondWith)
}

self.addEventListener('install', onInstall)
self.addEventListener('activate', onActivate)
self.addEventListener('fetch', onFetch)

// ─── Strategies ──────────────────────────────────────────────────────────────

/**
 * Cache-first strategy: serve from cache immediately, fetch and populate on miss.
 * Suitable for immutable content-hashed assets that never change at the same URL.
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok) {
    const cache = await caches.open(CACHE_VERSION)
    await cache.put(request, response.clone())
  }
  return response
}

/**
 * Network-first strategy for navigation requests.
 * All navigation URLs on this SPA serve the same shell; responses are stored under
 * the canonical key '/' (pathname-only) so that UTM/query-string variants don't
 * create unbounded cache entries on long-lived clients.
 * Falls back to the cached shell, then the offline page.
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function navigateFetch(request) {
  // Normalize to pathname to prevent unbounded cache growth from query-string variants
  const cacheKey = new URL(request.url).pathname
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_VERSION)
      await cache.put(cacheKey, response.clone())
    }
    return response
  } catch {
    // Offline: serve the cached shell or the offline page
    return (
      (await caches.match(cacheKey)) ??
      (await caches.match('/')) ??
      (await caches.match(OFFLINE_PAGE))
    )
  }
}

/**
 * Stale-while-revalidate strategy: return cached response immediately if available,
 * while refreshing the cache in the background. Falls through to the network when
 * no cached entry exists. The background fetch rejection is explicitly suppressed
 * to avoid unhandled promise rejections when a cached response is returned.
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_VERSION)
  const cached = await cache.match(request)
  const fetchPromise = fetch(request).then(async (response) => {
    if (response.ok) await cache.put(request, response.clone())
    return response
  })
  if (cached) {
    void fetchPromise.catch(() => undefined)
    return cached
  }
  return await fetchPromise
}
