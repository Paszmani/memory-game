const VERSION   = 'v1.2';
const CACHE_KEY = `memory-game-${VERSION}`;

const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
];

// Instala e pré-cacheia
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_KEY).then((cache) =>
      cache.addAll(PRECACHE).catch(() => {})
    )
  );
});

// Limpa caches antigos
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_KEY).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Estratégia: Network first → Cache fallback
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Ignora requisições externas
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_KEY).then((c) => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() =>
        caches.match(e.request).then((cached) =>
          cached || caches.match('./')
        )
      )
  );
});