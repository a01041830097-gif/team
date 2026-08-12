const VERSION = 'v1'
const PRECACHE = `precache-${VERSION}`
const RUNTIME_CACHE = `runtime-${VERSION}`
const OFFLINE_URL = '/offline.html'

const PRECACHE_URLS = [
  OFFLINE_URL,
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== PRECACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

async function handleNavigate(request) {
  const runtime = await caches.open(RUNTIME_CACHE)
  try {
    const response = await fetch(request)
    if (response && response.ok) {
      runtime.put(request, response.clone())
    }
    return response
  } catch (err) {
    const cached = await runtime.match(request)
    if (cached) return cached
    const precache = await caches.open(PRECACHE)
    const offline = await precache.match(OFFLINE_URL)
    return offline || Response.error()
  }
}

async function cacheFirst(request) {
  const runtime = await caches.open(RUNTIME_CACHE)
  const cached = await runtime.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response && response.ok) {
      runtime.put(request, response.clone())
    }
    return response
  } catch (err) {
    return cached || Response.error()
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigate(request))
    return
  }

  if (
    url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/logo.png' ||
    url.pathname === '/manifest.webmanifest'
  ) {
    event.respondWith(cacheFirst(request))
  }
})
