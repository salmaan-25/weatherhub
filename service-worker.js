const CACHE_NAME = "weather-app-cache-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./styles.css",
  "./script.js",
  "https://cdn.jsdelivr.net/npm/chart.js" // CDN used
];

// Install the service worker
self.addEventListener('install', function (event) {
    event.waitUntil(
      caches.open('v1').then(function (cache) {
        return cache.addAll([
          '/',
          '/index.html',
          '/style.css',
          '/script.js',
          '/manifest.json',
          '/icons/icon-192.png',
          '/icons/icon-512.png',
        ]);
      })
    );
  });
  

// Activate the service worker
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) return caches.delete(cache);
        })
      )
    )
  );
});

// Fetch cached content
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
