const CACHE_VERSION = 'v1.0.2';
const CACHE_NAME = `orion_cache_${CACHE_VERSION}`;

const STATIC_ASSETS = [
    './index.html',
    './',
    './css/chat.css',
    './css/highlight_js/themes/github-dark-dimmed.css',
    './favicon.png',
    './imgs/icons/orion_192x192.png',
    './imgs/new-chat.png',
    './imgs/screenshot.png',
    './imgs/settings.png',
    './js/4devs.js',
    './js/google_cse.js',
    './js/library/highlight.js',
    './js/library/showdown@1.9.0.js',
    './js/library/showdown@2.1.0.js',
    './js/md5.js',
    './js/prompts.js',
    './js/script.js',
    './js/stt.js',
    './js/tools_list.js',
    './js/tts.js',
    './manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching static assets...');
                return cache.addAll(STATIC_ASSETS)
                    .then(() => {
                        console.log('Static assets cached successfully');
                        return self.skipWaiting();
                    });
            })
            .catch(error => {
                console.error('Cache installation failed:', error);
                throw error;
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => {
                            return cacheName.startsWith('orion_cache_') && cacheName !== CACHE_NAME;
                        })
                        .map(cacheName => {
                            console.log('Removing old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('New service worker activated');
                return self.clients.claim();
            })
    );
});

self.addEventListener('fetch', event => {
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        Promise.race([
            new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Timeout')), 5000);
            }),

            caches.match(event.request)
                .then(cachedResponse => {
                    if (cachedResponse) {
                        fetch(event.request)
                            .then(networkResponse => {
                                if (networkResponse.ok) {
                                    caches.open(CACHE_NAME)
                                        .then(cache => cache.put(event.request, networkResponse));
                                }
                            })
                            .catch(() => {  });

                        return cachedResponse;
                    }

                    return fetch(event.request)
                        .then(networkResponse => {
                            if (!networkResponse || !networkResponse.ok) {
                                throw new Error('Network response was not ok');
                            }

                            const responseToCache = networkResponse.clone();

                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseToCache);
                                });

                            return networkResponse;
                        });
                })
        ]).catch(error => {
            console.error('Fetch handler failed:', error);

            if (event.request.mode === 'navigate') {
                return caches.match('./index.html');
            }

            return new Response('Network error', {
                status: 408,
                headers: new Headers({
                    'Content-Type': 'text/plain'
                })
            });
        })
    );
});

self.addEventListener('message', event => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});