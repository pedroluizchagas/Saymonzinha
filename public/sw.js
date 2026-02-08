const SW_VERSION = "1.0.0"
const CACHE_NAME = `saymoncell-admin-${SW_VERSION}`
const ADMIN_PREFIX = "/admin"
const PRECACHE_URLS = [
  "/offline-admin.html",
  "/manifest.webmanifest",
  "/icon.svg",
  "/apple-icon.png",
  "/images/logo.png",
]

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting()),
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys.map((key) => {
          if (key.startsWith("saymoncell-admin-") && key !== CACHE_NAME) {
            return caches.delete(key)
          }
          return Promise.resolve()
        }),
      )
      await self.clients.claim()
    })(),
  )
})

function isAdminNavigation(request, url) {
  const isNavigate = request.mode === "navigate"
  const isHTML = request.headers.get("accept")?.includes("text/html")
  return (isNavigate || isHTML) && url.pathname.startsWith(ADMIN_PREFIX)
}

function isStaticAsset(url) {
  if (url.pathname.startsWith("/_next/static/")) return true
  const ext = url.pathname.split(".").pop()
  return ["css", "js", "png", "jpg", "jpeg", "webp", "svg", "ico", "gif"].includes(ext)
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME)
  try {
    const response = await fetch(request)
    if (response && response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    if (request.mode === "navigate") {
      const offline = await cache.match("/offline-admin.html")
      if (offline) return offline
    }
    throw new Error("Offline and no cache")
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request)
  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone())
      }
      return response
    })
    .catch(() => undefined)
  return cached || (await networkPromise) || cached
}

self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (isAdminNavigation(request, url)) {
    event.respondWith(networkFirst(request))
    return
  }

  if (isStaticAsset(url)) {
    event.respondWith(staleWhileRevalidate(request))
    return
  }
})
