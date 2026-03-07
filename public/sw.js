const CACHE_NAME = 'budget-categorization-v1'
const APP_SHELL_ASSETS = ['/', '/offline', '/icons/icon-192.png', '/icons/icon-512.png']

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(APP_SHELL_ASSETS)
        }),
    )

    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => {
                        return caches.delete(key)
                    }),
            )
        }),
    )

    self.clients.claim()
})

self.addEventListener('fetch', (event) => {
    const request = event.request

    if (request.method !== 'GET') {
        return
    }

    const url = new URL(request.url)
    const isSameOrigin = url.origin === self.location.origin

    if (!isSameOrigin) {
        return
    }

    if (url.pathname.startsWith('/api/')) {
        event.respondWith(fetch(request))
        return
    }

    const isNavigationRequest = request.mode === 'navigate'

    if (isNavigationRequest) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const responseClone = response.clone()
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone)
                    })
                    return response
                })
                .catch(async () => {
                    const cachedPage = await caches.match(request)
                    if (cachedPage) {
                        return cachedPage
                    }

                    return caches.match('/offline')
                }),
        )
        return
    }

    const isStaticAsset =
        url.pathname.startsWith('/_next/static/') ||
        url.pathname.startsWith('/icons/') ||
        /\.(?:js|css|woff2?|png|jpg|jpeg|svg|webp|ico)$/.test(url.pathname)

    if (isStaticAsset) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                const networkResponsePromise = fetch(request)
                    .then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            const responseClone = networkResponse.clone()
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(request, responseClone)
                            })
                        }
                        return networkResponse
                    })
                    .catch(() => cachedResponse)

                return cachedResponse || networkResponsePromise
            }),
        )
    }
})
