const CACHE_NAME = 'finances-shell-v2';
const APP_SHELL = [
  '/dashboard',
  '/manifest.webmanifest',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
];
const STATIC_DESTINATIONS = new Set(['style', 'script', 'image', 'font', 'manifest']);

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // One unavailable route must not make the worker fail to install.
    await Promise.allSettled(APP_SHELL.map((asset) => cache.add(asset)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
    )),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => (
        await caches.match('/dashboard')
        ?? await caches.match('/')
        ?? Response.error()
      )),
    );
    return;
  }

  if (!STATIC_DESTINATIONS.has(event.request.destination)) return;

  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;

    const response = await fetch(event.request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(event.request, response.clone());
    }
    return response;
  })());
});

self.addEventListener('push', (event) => {
  let data = { title: 'Finances', body: 'Você tem uma nova notificação.', href: '/dashboard' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // Usa o conteúdo padrão quando o payload não for JSON.
  }
  event.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icon.svg',
    badge: '/icon.svg',
    data: { href: data.href },
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const href = event.notification.data?.href || '/dashboard';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const client = clients.find((candidate) => 'focus' in candidate);
      if (client) {
        client.focus();
        return client.navigate(href);
      }
      return self.clients.openWindow(href);
    }),
  );
});
