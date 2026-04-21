/**
 * Mustand Service Worker
 * يساعد في جعل التطبيق يعمل كـ PWA ويدعم وضع الأوفلاين البسيط
 */
const CACHE_NAME = 'mustand-v1';
const ASSETS = [
  '/',
  '/globals.css',
  '/logo-mustand.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});