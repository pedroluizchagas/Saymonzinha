const SW_VERSION = "2.0.0"
const CACHE_NAME = "saymoncell-v" + SW_VERSION
const APP_PREFIXES = ["/admin", "/auth"]
const PRECACHE_URLS = [
  "/offline-admin.html",
  "/manifest.webmanifest",
  "/icon.svg",
  "/apple-icon.png",
  "/images/logo.png",
]

// ----------------------------------------------------------
// Mensagens
// ----------------------------------------------------------
self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

// ----------------------------------------------------------
// Install - pre-cache de recursos essenciais
// ----------------------------------------------------------
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(PRECACHE_URLS)
      })
      .then(function () {
        return self.skipWaiting()
      })
  )
})

// ----------------------------------------------------------
// Activate - limpa caches antigos e assume controle
// ----------------------------------------------------------
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys.map(function (key) {
            if (key.startsWith("saymoncell-") && key !== CACHE_NAME) {
              return caches.delete(key)
            }
            return Promise.resolve()
          })
        )
      })
      .then(function () {
        // Assume controle de todas as abas imediatamente
        // Essencial para iOS onde o SW pode demorar a ativar
        return self.clients.claim()
      })
  )
})

// ----------------------------------------------------------
// Helpers de classificacao
// ----------------------------------------------------------
function isAppNavigation(request, url) {
  if (request.mode !== "navigate") return false
  for (var i = 0; i < APP_PREFIXES.length; i++) {
    if (url.pathname.startsWith(APP_PREFIXES[i])) return true
  }
  return false
}

function isStaticAsset(url) {
  if (url.pathname.startsWith("/_next/static/")) return true
  if (url.pathname.startsWith("/_next/image")) return true
  var ext = url.pathname.split(".").pop()
  return (
    ["css", "js", "png", "jpg", "jpeg", "webp", "svg", "ico", "gif", "woff", "woff2", "ttf"].indexOf(ext) !== -1
  )
}

function isApiRequest(url) {
  return (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/data/") ||
    url.hostname.includes("supabase")
  )
}

// ----------------------------------------------------------
// Estrategias de cache
// ----------------------------------------------------------
function networkFirst(request) {
  return caches.open(CACHE_NAME).then(function (cache) {
    return fetch(request)
      .then(function (response) {
        if (response && response.ok) {
          cache.put(request, response.clone())
        }
        return response
      })
      .catch(function () {
        return cache.match(request).then(function (cached) {
          if (cached) return cached
          if (request.mode === "navigate") {
            return cache.match("/offline-admin.html")
          }
          return new Response("Offline", { status: 503, statusText: "Offline" })
        })
      })
  })
}

function staleWhileRevalidate(request) {
  return caches.open(CACHE_NAME).then(function (cache) {
    return cache.match(request).then(function (cached) {
      var fetchPromise = fetch(request)
        .then(function (response) {
          if (response && response.ok) {
            cache.put(request, response.clone())
          }
          return response
        })
        .catch(function () {
          return undefined
        })
      return cached || fetchPromise
    })
  })
}

function networkOnly(request) {
  return fetch(request).catch(function () {
    return new Response("{}", {
      status: 503,
      statusText: "Offline",
      headers: { "Content-Type": "application/json" },
    })
  })
}

// ----------------------------------------------------------
// Fetch handler principal
// ----------------------------------------------------------
self.addEventListener("fetch", function (event) {
  var request = event.request
  var url = new URL(request.url)

  // Ignora requests que nao sao HTTP/HTTPS
  if (!url.protocol.startsWith("http")) return

  // Ignora requests de extensoes do browser
  if (url.origin !== self.location.origin && !url.hostname.includes("supabase")) return

  // API requests - network only (sem cache)
  if (isApiRequest(url)) {
    event.respondWith(networkOnly(request))
    return
  }

  // Navegacao para rotas da app - network first com fallback offline
  if (isAppNavigation(request, url)) {
    event.respondWith(networkFirst(request))
    return
  }

  // Assets estaticos - stale while revalidate
  if (isStaticAsset(url)) {
    event.respondWith(staleWhileRevalidate(request))
    return
  }
})
