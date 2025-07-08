// sw.js
const VERSION = '0.6.0';

const urlsToCache = [
    // '/expo/index.html',
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

// fetchイベントでリクエストに応じたキャッシュ戦略を実装
self.addEventListener('fetch', (event) => {
    // ページ遷移リクエスト(HTML)の場合
    if (event.request.mode === 'navigate') {
        event.respondWith(
            // まずはネットワークから取得を試みる
            fetch(event.request)
                .then(response => {
                    // 取得に成功したら、レスポンスをそのまま返す
                    return response;
                })
                .catch(() => {
                    // ネットワークがオフラインなどで失敗した場合、キャッシュからindex.htmlを探して返す
                    return caches.match('/expo/index.html');
                })
        );
        return;
    }

    // CSS, JS, 画像などのアセットリクエストの場合
    event.respondWith(
        caches.match(event.request).then((response) => {
            // キャッシュがあればそれを返し、なければネットワークから取得する
            return response || fetch(event.request).then((fetchResponse) => {
                // 新しく取得したアセットはキャッシュに保存しておく
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, fetchResponse.clone());
                    return fetchResponse;
                });
            });
        })
    );
});