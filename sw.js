self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('expo-cache-v0.1').then((cache) => {
            return cache.addAll([
                '/expo/index.html',
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

// self.addEventListener('message', (event) => {
//   if (event.data && event.data.type === 'SKIP_WAITING') {
//     self.skipWaiting();
//   }
// });
