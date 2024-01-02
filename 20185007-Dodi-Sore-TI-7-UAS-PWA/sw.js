const appCacheName = `app-v1`;
const dataCacheName = `data`;
const staticAssets = [
    `./`,
    `./app.js`,
    `./styles.css`
];
self.addEventListener('install', async function(){
    const cache = await cache.open(appCacheName); 
    cache.addAll(staticAssets);
});
self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    if (url.origin === location.origin) {
        event.respondWith(cacheFirst(request));
    } else {
        event.respondWith(networkFirst(request));
    }
});

async function cacheFirst (request) {
    const cacheResponse = await caches.match(request);
    return cacheResponse || fetch(request);
}

async function networkFirst(request) {
    const dataCache = await caches.open(dataCacheName);
    try {
        const networkResponse = await fetch(request);
        dataCache.put(request, networkResponse.clone());
        return networkResponse;
    } catch (err){
        const cacheResponse = await dataCache.match(`./fallback.json`);
    }
}