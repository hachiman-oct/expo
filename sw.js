self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('expo-cache-v0.0.1').then((cache) => {
            console.log('Service Worker: Caching files');
            return cache.addAll([
                '/expo/map.html',
                '/expo/prep.html',
                '/expo/others.html',
                '/expo/manifest.json',
                '/expo/icons/favicon.ico',
                '/expo/icons/icon-180.png',
                '/expo/style/style.css',
                '/expo/src/map.webp',
                '/expo/src/map-device.png',
                '/expo/src/map-toilet.png',
                '/expo/src/map-water.png',
                '/expo/src/wallpaper-ios.jpg',
            ]);
        }).catch(err => {
            console.error('Cache AddAll Failed:', err);
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

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
