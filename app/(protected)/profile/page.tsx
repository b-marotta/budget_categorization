'use client'

import { RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function Account() {
    return (
        <main className="flex h-full w-full flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Account</h1>
            </div>
            <div className="flex h-full w-full flex-col">
                <div className="flex">
                    <p className="text-muted-foreground">
                        Aggiorna la pagina per vedere le nuove funzionalità della Web App!
                    </p>
                    <Button
                        variant="default"
                        className="h-12 w-16 p-2 [&_svg]:size-5"
                        onClick={() => window.location.reload()}
                    >
                        <RefreshCw />
                    </Button>
                </div>
            </div>
        </main>
    )
}
