const CACHE_NAME = "julianverse-uucc-v1";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.json",
  "./opensearch.xml",
  "./icons/icon.svg",
  "./src/app.js",
  "./src/parser.js",
  "./src/router.js",
  "./src/storage.js",
  "./src/ui.js",
  "./src/converters/index.js",
  "./src/converters/absurd.js",
  "./src/converters/special.js",
  "./src/converters/units.js",
  "./src/converters/temperature.js",
  "./src/converters/currency.js",
  "./src/data/aliases.js",
  "./src/data/unit-definitions.js",
  "./src/data/currencies.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
