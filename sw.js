const CACHE_NAME = 'amar-routine-v1';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js'
];

// ১. সার্ভিস ওয়ার্কার ইনস্টল করা এবং ফাইলগুলো ক্যাশ (Cache) করা
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// ২. পুরানো ক্যাশ ডিলিট করা (Activation)
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// ৩. অফলাইন সাপোর্ট (Fetch Request Handler)
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            return cachedResponse || fetch(e.request);
        })
    );
});

// ৪. ব্যাকগ্রাউন্ড নোটিফিকেশন ইভেন্ট হ্যান্ডলার
self.addEventListener('notificationclick', (e) => {
    e.notification.close();
    e.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('./');
            }
        })
    );
});
