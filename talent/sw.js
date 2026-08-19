const CACHE_NAME = "knt-talent-v11";
const APP_FILES = ["./", "index.html", "styles.css?v=11", "questions.js?v=11", "questions-hard-2.js?v=11", "questions-level3-extra.js?v=11", "questions-level3-more.js?v=11", "questions-level3-more-b.js?v=11", "questions-level12-extra.js?v=11", "app.js?v=11", "manifest.webmanifest?v=6"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./")))
  );
});
