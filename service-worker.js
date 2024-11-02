/// {"authors": {"70%": "AI", "30%": "Human"}} :)

const CACHE_VERSION = 'v12.0.6';

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
    // Ignore non-GET requests and requests from different origins
    if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // Check if the request is for an API or dynamic content
    const url = new URL(event.request.url);
    if (event.request.headers.get('accept')?.includes('application/json') ||
        url.pathname.includes('/api/') ||
        event.request.headers.get('x-requested-with') === 'XMLHttpRequest') {
        // Don't cache API/XHR requests - just fetch from network
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
                        // Return cached response immediately
                        return cachedResponse;
                    }

                    // If not in cache, fetch from network
                    return fetch(event.request)
                        .then(networkResponse => {
                            if (!networkResponse || !networkResponse.ok) {
                                throw new Error('Network response was not ok');
                            }

                            // Cache only static assets
                            if (STATIC_ASSETS.some(asset => event.request.url.endsWith(asset))) {
                                const responseToCache = networkResponse.clone();
                                caches.open(CACHE_NAME)
                                    .then(cache => {
                                        cache.put(event.request, responseToCache);
                                    });
                            }

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