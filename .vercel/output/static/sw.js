// Minimal PWA service worker for KRUH ŽIVLJENJA.
// NetworkFirst for HTML navigations (so new deploys roll out cleanly),
// cache-first for same-origin static assets, with an offline app-shell fallback.
const VERSION = "kz-v1";
const HTML_CACHE = `${VERSION}-html`;
const ASSET_CACHE = `${VERSION}-assets`;
const OFFLINE_URL = "/";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(HTML_CACHE);
      try { await cache.add(new Request(OFFLINE_URL, { cache: "reload" })); } catch (_) {}
      self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Never cache API / server-fn / auth endpoints.
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_serverFn") ||
    url.pathname.startsWith("/lovable/") ||
    url.pathname.startsWith("/~oauth")
  ) return;

  if (req.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(HTML_CACHE);
        cache.put(OFFLINE_URL, fresh.clone()).catch(() => {});
        return fresh;
      } catch (_) {
        const cache = await caches.open(HTML_CACHE);
        const cached = await cache.match(OFFLINE_URL);
        return cached || Response.error();
      }
    })());
    return;
  }

  // Cache-first for static assets.
  if (/\.(?:js|css|woff2?|png|jpg|jpeg|svg|ico|webp|gif)$/i.test(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(ASSET_CACHE);
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const fresh = await fetch(req);
        if (fresh.ok) cache.put(req, fresh.clone()).catch(() => {});
        return fresh;
      } catch (_) {
        return cached || Response.error();
      }
    })());
  }
});
