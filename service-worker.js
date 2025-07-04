self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('expo-cache').then((cache) => {
            return cache.addAll([
                '/expo/',
                '/expo/index.html',
                '/expo/manifest.json',
                '/expo/style/style.css',
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
