'use client'

import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[]
    prompt(): Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const DISMISS_KEY = 'pwa-install-dismissed'

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [isInstalled, setIsInstalled] = useState(false)
    const [isDismissed, setIsDismissed] = useState(false)

    useEffect(() => {
        const checkInstalled = () => {
            const inStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
            const iosStandalone =
                'standalone' in navigator && (navigator as { standalone?: boolean }).standalone
            setIsInstalled(Boolean(inStandaloneMode || iosStandalone))
        }

        checkInstalled()

        const dismissed = localStorage.getItem(DISMISS_KEY) === '1'
        setIsDismissed(dismissed)

        const onBeforeInstallPrompt = (event: Event) => {
            event.preventDefault()
            setDeferredPrompt(event as BeforeInstallPromptEvent)
        }

        const onInstalled = () => {
            setIsInstalled(true)
            setDeferredPrompt(null)
        }

        window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
        window.addEventListener('appinstalled', onInstalled)

        return () => {
            window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
            window.removeEventListener('appinstalled', onInstalled)
        }
    }, [])

    const isIOS = useMemo(() => {
        if (typeof navigator === 'undefined') {
            return false
        }

        return /iphone|ipad|ipod/i.test(navigator.userAgent)
    }, [])

    const canShowPrompt = !isInstalled && !isDismissed && (Boolean(deferredPrompt) || isIOS)

    const handleInstall = async () => {
        if (!deferredPrompt) {
            return
        }

        try {
            await deferredPrompt.prompt()
            await deferredPrompt.userChoice
        } finally {
            setDeferredPrompt(null)
        }
    }

    const handleDismiss = () => {
        localStorage.setItem(DISMISS_KEY, '1')
        setIsDismissed(true)
    }

    if (!canShowPrompt) {
        return null
    }

    return (
        <div className="bg-card/95 border-border fixed right-4 bottom-24 left-4 z-40 rounded-lg border p-4 shadow sm:left-auto sm:w-96">
            <p className="text-sm font-medium">Installa l’app</p>
            <p className="text-muted-foreground mt-1 text-xs">
                {deferredPrompt
                    ? 'Aggiungi Budget Categorization alla schermata Home per un accesso più rapido.'
                    : 'Su iPhone: apri Condividi in Safari e scegli “Aggiungi a schermata Home”.'}
            </p>
            <div className="mt-3 flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={handleDismiss}>
                    Non ora
                </Button>
                {deferredPrompt ? (
                    <Button size="sm" onClick={handleInstall}>
                        Installa
                    </Button>
                ) : null}
            </div>
        </div>
    )
}
