const CACHE_NAME = 'orion_cache_v0';
const urlsToCache = [
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
                console.log('open cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});
