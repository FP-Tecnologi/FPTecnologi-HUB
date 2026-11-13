/* Service worker del dashboard (Fase 1 PWA): guarda el "cascarón" estático para que la app abra sin red.
   No cachea páginas ni respuestas de la API (datos privados): eso es la Fase 2. Sube VERSION para forzar limpieza. */
const VERSION = 'v2';
const CACHE = `fp-shell-${VERSION}`;
const PAGES = 'fp-pages';
const OFFLINE_URL = '/offline.html';
const PRECACHE = [OFFLINE_URL, '/pwa/icon-192.png', '/pwa/icon-512.png', '/logo-fptecnologi.svg', '/logo-fptecnologi-icon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('fp-shell-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const esEstatico = (url) =>
  url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/pwa/') || /\.(?:svg|png|jpg|webp|ico|woff2?)$/.test(url.pathname);

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // API y fuentes de Google: directo a la red

  // Páginas (y datos RSC de Next al navegar entre pantallas): red primero; sin red, la última copia guardada.
  // Son solo la estructura de la pantalla: los datos del usuario vienen de la API y no pasan por aquí.
  // La copia se borra al cerrar sesión (offline.ts → borrarTodoOffline).
  if (req.mode === 'navigate' || url.searchParams.has('_rsc')) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok && !res.redirected && !url.pathname.startsWith('/auth')) {
            const copia = res.clone();
            caches.open(PAGES).then((c) => c.put(req, copia));
          }
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || (req.mode === 'navigate' ? caches.match(OFFLINE_URL) : Response.error()))),
    );
    return;
  }
  if (esEstatico(url)) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) { const copia = res.clone(); caches.open(CACHE).then((c) => c.put(req, copia)); }
        return res;
      })),
    );
  }
});
