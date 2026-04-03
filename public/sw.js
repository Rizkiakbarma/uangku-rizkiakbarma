// sw.js - Basic Service Worker untuk meluluskan audit Progressive Web App (PWA)
const CACHE_NAME = 'budgetin-cache-v1';

// Lakukan cache halaman dasar agar bisa terbuka sesaat sebelum realtime terhubung
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Offline fallback sementara
      return cache.addAll([
        '/',
        '/index.html',
        '/favicon.ico',
        '/manifest.json'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Hanya lakukan pass-through untuk API Calls (semua ditangani secara online oleh React)
  // Ini cukup untuk meloloskan aturan Installability "Memiliki fetch handler" dari Chrome
  event.respondWith(
    fetch(event.request).catch(() => {
      // Bila offline total, tampilkan asset cache dasar
      return caches.match(event.request);
    })
  );
});
