const CACHE_NAME = "swipetrade-v3";
const STATIC_ASSETS = ["/", "/play", "/daily", "/profile", "/learn", "/speed", "/challenges", "/leaderboard"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip API requests — always fetch fresh
  if (request.url.includes("/api/")) return;

  // Network-first for navigation, cache-first for static assets
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/")))
    );
  } else {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          // Cache JS, CSS, fonts, and images for offline support
          if (response.ok) {
            const url = request.url;
            const shouldCache =
              url.includes("/_next/static/") ||
              url.endsWith(".js") ||
              url.endsWith(".css") ||
              url.endsWith(".woff2") ||
              url.endsWith(".svg") ||
              url.endsWith(".png") ||
              url.endsWith(".ico");
            if (shouldCache) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
          }
          return response;
        });
      })
    );
  }
});
