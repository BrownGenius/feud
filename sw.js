// =====================================================================
// PARTY FEUD SERVICE WORKER (sw.js)
// Enables PWA installation & offline app shell caching over HTTPS / localhost.
// =====================================================================

const CACHE_NAME = "party-feud-v20261120b";

const APP_SHELL = [
  "./",
  "./index.html",
  "./review.html",
  "./css/styles.css",
  "./js/audio.js",
  "./js/state.js",
  "./js/formats.js",
  "./js/decks.js",
  "./js/sync.js",
  "./js/views.js",
  "./js/app.js",
  "./decks/manifest.json",
  "./manifest.webmanifest",
  "./icons/icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.allSettled(
          APP_SHELL.map((asset) =>
            cache.add(new Request(asset, { cache: "reload" })).catch(() => {})
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("party-feud-") && k !== CACHE_NAME)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (!req || req.method !== "GET") return;

  let url;
  try {
    url = new URL(req.url);
  } catch (e) {
    return;
  }

  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then((networkRes) => {
        if (networkRes && networkRes.ok) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, clone).catch(() => {});
          });
        }
        return networkRes;
      })
      .catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const exact = await cache.match(req);
        if (exact) return exact;
        const noQuery = await cache.match(url.pathname);
        if (noQuery) return noQuery;
        if (req.mode === "navigate") {
          const fallback = await cache.match("./index.html");
          if (fallback) return fallback;
        }
        return Response.error();
      })
  );
});
