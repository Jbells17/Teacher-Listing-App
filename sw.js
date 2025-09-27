// sw.js - Service Worker for Clear Grading To-Do PWA
const CACHE_NAME = 'grading-todo-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                return fetch(event.request);
            }
        )
    );
});

// Listen for badge update messages from the main app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'UPDATE_BADGE') {
        updateBadge(event.data.count);
    }
});

// Update badge count (for iOS PWA)
async function updateBadge(count) {
    // Badge API - works on iOS 16.4+ PWAs
    if ('setAppBadge' in self.navigator) {
        try {
            if (count > 0) {
                await self.navigator.setAppBadge(count);
            } else {
                await self.navigator.clearAppBadge();
            }
            console.log('Badge updated:', count);
        } catch (error) {
            console.log('Badge API not supported:', error);
        }
    }
}