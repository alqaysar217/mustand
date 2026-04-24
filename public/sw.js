// Service Worker بسيط لتمكين ميزة التثبيت (PWA)
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // يمكن إضافة منطق التخزين المؤقت هنا لاحقاً للعمل بدون إنترنت
});