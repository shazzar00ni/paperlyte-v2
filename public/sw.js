'use strict'

const CACHE_VERSION = 'paperlyte-v1'
const OFFLINE_PAGE = '/offline.html'

// Pre-cache these on install so offline fallback is always available
const PRECACHE = [
  '/',
  OFFLINE_PAGE,
  '/site.webmanifest',
  '/fonts/Inter-Variable.woff2',
  '/fonts/PlayfairDisplay-Variable.woff2',
]

// Vite-hashed assets (content-addressed, immutable) → cache-first
const HASHED_ASSET_RE = /^\/assets\/.+\.(js|css|woff2?)$/

// Other cacheable static files (images, icons, fonts) → stale-while-revalidate
const CACHEABLE_RE = /\.(png|jpg|jpeg|webp|avif|svg|ico|woff2?)$/

// ─── Lifecycle ───────────────────────────────────────────────────────────────

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  )
})

// ─── Fetch routing ───────────────────────────────────────────────────────────

self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Only intercept same-origin GET requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  const path = url.pathname

  if (HASHED_ASSET_RE.test(path)) {
    // Content-hashed Vite bundles never change; serve from cache, populate on miss
    event.respondWith(cacheFirst(request))
  } else if (request.mode === 'navigate') {
    // HTML navigation: try network, fall back to app shell, then offline page
    event.respondWith(navigateFetch(request))
  } else if (CACHEABLE_RE.test(path)) {
    // Images, fonts, icons: serve stale immediately, refresh in background
    event.respondWith(staleWhileRevalidate(request))
  }
  // Everything else: let the browser handle normally (no respondWith)
})

// ─── Strategies ──────────────────────────────────────────────────────────────

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok) {
    const cache = await caches.open(CACHE_VERSION)
    cache.put(request, response.clone())
  }
  return response
}

async function navigateFetch(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_VERSION)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    // Offline: serve the cached version of this URL, or the app shell, or the offline page
    return (
      (await caches.match(request)) ??
      (await caches.match('/')) ??
      (await caches.match(OFFLINE_PAGE))
    )
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_VERSION)
  const cached = await cache.match(request)
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone())
    return response
  })
  return cached ?? (await fetchPromise)
}
