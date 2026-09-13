// Only this application's static files belong in its cache. API responses stay on the network.
const CACHE_NAME = "knt-classroom-v21";
const CACHE_PREFIX = "knt-classroom-";
const APP_SHELL = ["./", "./index.html", "./styles.css?v=10", "./app.js?v=19", "../js/network.js?v=1", "./manifest.webmanifest", "./icons/icon.svg", "./icons/icon-192.png", "./icons/icon-512.png"];
const OPTIONAL_FILES = ["./roster-data.js?v=7"];
const allowed = new Set([...APP_SHELL, ...OPTIONAL_FILES].map(path => new URL(path, self.location.href).href));
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  const cacheKey = request.mode === 'navigate' ? url.origin + url.pathname : url.href;
  if (request.method !== 'GET' || url.origin !== self.location.origin || !allowed.has(cacheKey)) return;
  const update = async () => {
    const response = await fetch(request);
    if (!response.ok) throw new Error('Static resource unavailable');
    const cache = await caches.open(CACHE_NAME);
    await cache.put(cacheKey, response.clone());
    return response;
  };
  if (request.mode === 'navigate') {
    const fresh = update();
    event.waitUntil(fresh.catch(() => {}));
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedShell = await cache.match(cacheKey);
      if (cachedShell) return cachedShell;
      let timer;
      try { return await Promise.race([fresh, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('slow')), 2500); })]); }
      catch { const cache = await caches.open(CACHE_NAME); const cached = await cache.match(cacheKey) || await cache.match(new URL('./index.html', self.location.href)); return cached || Response.error(); }
      finally { clearTimeout(timer); }
    })());
  } else {
    event.respondWith((async () => {
      const cached = await (await caches.open(CACHE_NAME)).match(cacheKey);
      if (cached) return cached;
      try { return await update(); } catch { return Response.error(); }
    })());
  }
});
