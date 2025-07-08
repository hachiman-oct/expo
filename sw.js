// sw.js
const VERSION = '0.4.2';

const urlsToCache = [
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
    '/expo/scripts/notify.js',
    '/expo/scripts/index.js',
];

const CACHE_PREFIX = 'expo-pwa';
const CACHE_NAME = `${CACHE_PREFIX}-${VERSION}`;

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            }).catch(err => {
                console.error('Cache AddAll Failed:', err);
            })
    );
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker: activate');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting().then(() => {
            return self.clients.claim();
        });
    } else if (event.data && event.data.command === 'getVersion') {
        event.source.postMessage({ version: VERSION });
    }
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});
