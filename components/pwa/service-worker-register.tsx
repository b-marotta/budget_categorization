'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegister() {
    useEffect(() => {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
            return
        }

        const isDevelopment = process.env.NODE_ENV === 'development'

        if (isDevelopment) {
            const unregisterServiceWorkers = async () => {
                try {
                    const registrations = await navigator.serviceWorker.getRegistrations()
                    await Promise.all(
                        registrations.map((registration) => registration.unregister()),
                    )

                    if ('caches' in window) {
                        const cacheKeys = await window.caches.keys()
                        await Promise.all(cacheKeys.map((key) => window.caches.delete(key)))
                    }
                } catch (error) {
                    console.error('Service worker cleanup failed:', error)
                }
            }

            unregisterServiceWorkers()
            return
        }

        const registerServiceWorker = async () => {
            try {
                await navigator.serviceWorker.register('/sw.js', { scope: '/' })
            } catch (error) {
                console.error('Service worker registration failed:', error)
            }
        }

        registerServiceWorker()
    }, [])

    return null
}
