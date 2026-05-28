// Service Worker Cache Manifest Identifiers
const CACHE_NAME = "amarroutine-v2";
const ASSETS_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js"
];

// Installation Interception State Process Loop Channel
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Caching Service Application Resources Manifest Successfully.");
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Cache Eviction Filtering Maintenance Process State
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log("Evicting Expired Local Storage Resource Cache Storage Key Map:", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});

// Outbound Data Request Stream Interception Fetch Handling Routing Rules
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request).catch((err) => {
                console.error("Network Fetch Request Pipe Failure Exception Log Summary:", err);
            });
        })
    );
});
