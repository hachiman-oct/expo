self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('expo-cache').then((cache) => {
            return cache.addAll([
                '/expo/',
                '/expo/index.html',
                '/expo/map.html',
                '/expo/prep.html',
                '/expo/others.html',
                '/expo/manifest.json',
                '/expo/style/style.css',
                '/expo/src/map.webp',
                '/expo/src/map-device.png',
                '/expo/src/map-toilet.png',
                '/expo/src/map-water.png',
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
