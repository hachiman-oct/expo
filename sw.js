// sw.js

const VERSION = '3.1.2';

const urlsToCache = [
    '/expo/manifest.json',
    '/expo/pages/map/index.html',
    '/expo/pages/prep/index.html',
    '/expo/pages/prep/apps/index.html',
    '/expo/pages/others/index.html',
    '/expo/icons/favicon.ico',
    '/expo/icons/icon-180.png',
    '/expo/style/style.css',
    '/expo/src/maps/map.webp',
    '/expo/src/maps/map-device.png',
    '/expo/src/maps/map-toilet.png',
    '/expo/src/maps/map-water.png',
    '/expo/src/wallpaper-ios.jpg',
    '/expo/scripts/version.js',
    '/expo/scripts/index.js',
];

const CACHE_PREFIX = 'expo-pwa';
const CACHE_NAME = `${CACHE_PREFIX}-${VERSION}`;

// 1. installイベント: self.skipWaiting() を追加
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                // 新しいService Workerを即座に有効化する命令
                console.log('Service Worker: install complete, skipping waiting state');
                return self.skipWaiting();
            })
            .catch(err => {
                console.error('Cache AddAll or skipWaiting Failed:', err);
            })
    );
});

// 2. activateイベント: self.clients.claim() を追加
self.addEventListener('activate', (event) => {
    console.log('Service Worker: activate');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    console.log('Checking cache:', cacheName);
                    if (cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // 有効化されたService Workerが、即座にクライアント(ページ)の制御権を得る命令
            return self.clients.claim();
        })
    );
});

// 3. messageイベント: SKIP_WAITINGのリスナーは不要になったため削除
self.addEventListener('message', (event) => {
    // getVersionなど、他の目的で使う場合は残す
    if (event.data && event.data.command === 'getVersion') {
        event.source.postMessage({ version: VERSION });
    }
});

// fetchイベントのリスナーは変更なし
self.addEventListener('fetch', (event) => {
    // (中略) ... 以前のコードと同じ
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => caches.match('/expo/index.html'))
        );
        return;
    }
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((fetchResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, fetchResponse.clone());
                    return fetchResponse;
                });
            });
        })
    );
});