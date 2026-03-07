'use client'

import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'

export default function ServiceWorkerRegister() {
    const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const isReloadingRef = useRef(false)

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

        const onControllerChange = () => {
            if (isReloadingRef.current) {
                return
            }

            isReloadingRef.current = true
            window.location.reload()
        }

        navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)

        const watchRegistrationForUpdate = (registration: ServiceWorkerRegistration) => {
            if (registration.waiting) {
                setIsUpdateAvailable(true)
            }

            registration.addEventListener('updatefound', () => {
                const installingWorker = registration.installing

                if (!installingWorker) {
                    return
                }

                installingWorker.addEventListener('statechange', () => {
                    if (
                        installingWorker.state === 'installed' &&
                        navigator.serviceWorker.controller
                    ) {
                        setIsUpdateAvailable(true)
                    }
                })
            })
        }

        const registerServiceWorker = async () => {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/',
                })

                watchRegistrationForUpdate(registration)

                const existingRegistration = await navigator.serviceWorker.getRegistration('/')

                if (existingRegistration) {
                    watchRegistrationForUpdate(existingRegistration)
                }
            } catch (error) {
                console.error('Service worker registration failed:', error)
            }
        }

        registerServiceWorker()

        return () => {
            navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
        }
    }, [])

    const handleRefresh = async () => {
        if (isRefreshing) {
            return
        }

        setIsRefreshing(true)

        try {
            const registration = await navigator.serviceWorker.getRegistration('/')

            if (registration?.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' })
                return
            }

            window.location.reload()
        } catch (error) {
            console.error('App refresh failed:', error)
            window.location.reload()
        }
    }

    if (!isUpdateAvailable) {
        return null
    }

    return (
        <div className="bg-card/95 border-border fixed top-4 right-4 left-4 z-50 rounded-lg border p-4 shadow sm:left-auto sm:w-96">
            <p className="text-sm font-medium">App aggiornata</p>
            <p className="text-muted-foreground mt-1 text-xs">
                È disponibile una versione più recente. Premi refresh per applicare
                l&apos;aggiornamento.
            </p>
            <div className="mt-3 flex justify-end">
                <Button size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                    {isRefreshing ? 'Aggiornamento...' : 'Refresh'}
                </Button>
            </div>
        </div>
    )
}
