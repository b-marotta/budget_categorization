'use client'

import { useEffect, useState } from 'react'

import { Building2, Loader2, Search } from 'lucide-react'
import Image from 'next/image'

import { Institution } from '@/types'

import { Button } from '../ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'

export default function BankConnection() {
    const [institutions, setInstitutions] = useState<Institution[]>([])
    const [filteredInstitutions, setFilteredInstitutions] = useState<Institution[]>([])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [connecting, setConnecting] = useState<string | null>(null)

    useEffect(() => {
        loadInstitutions()
    }, [])

    useEffect(() => {
        if (!searchQuery) {
            setFilteredInstitutions(institutions)
        } else {
            setFilteredInstitutions(
                institutions.filter((inst) =>
                    inst.name.toLowerCase().includes(searchQuery.toLowerCase()),
                ),
            )
        }
    }, [searchQuery, institutions])

    const loadInstitutions = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/banks/institutions?country=IT')
            const data = await res.json()
            setInstitutions(data.institutions || [])
            setFilteredInstitutions(data.institutions || [])
        } catch (error) {
            console.error('Failed to load institutions:', error)
        } finally {
            setLoading(false)
        }
    }

    const connectBank = async (institution: Institution) => {
        setConnecting(institution.name)
        try {
            const res = await fetch('/api/banks/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    institution_name: institution.name,
                    institution_country: institution.country,
                }),
            })

            const data = await res.json()

            if (res.ok && data.authorization_url) {
                // Redirect to bank authorization
                window.location.href = data.authorization_url
            } else {
                console.error('Failed to connect bank:', data.error)
            }
        } catch (error) {
            console.error('Failed to connect bank:', error)
        } finally {
            setConnecting(null)
        }
    }

    return (
        <div className="flex h-full min-h-0 flex-1 flex-col gap-4 p-4 pt-0">
            {/* Search */}
            <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                    placeholder="Cerca la tua banca..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Institutions List */}
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
                {loading ? (
                    <div className="flex h-40 items-center justify-center">
                        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
                    </div>
                ) : filteredInstitutions.length === 0 ? (
                    <div className="flex h-40 flex-col items-center justify-center text-center">
                        <p className="text-muted-foreground">
                            {searchQuery ? 'Nessuna banca trovata' : 'Nessuna banca disponibile'}
                        </p>
                    </div>
                ) : (
                    filteredInstitutions.map((institution) => (
                        <Card
                            key={`${institution.name}-${institution.country}`}
                            className="hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => connectBank(institution)}
                        >
                            <CardHeader className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {institution.logo ? (
                                            <Image
                                                width={40}
                                                height={40}
                                                src={institution.logo}
                                                alt={institution.name}
                                                className="h-10 w-10 rounded object-contain"
                                            />
                                        ) : (
                                            <div className="bg-muted flex h-10 w-10 items-center justify-center rounded">
                                                <Building2 className="text-muted-foreground h-5 w-5" />
                                            </div>
                                        )}
                                        <div>
                                            <CardTitle className="text-base">
                                                {institution.name}
                                            </CardTitle>
                                            {institution.bic && (
                                                <CardDescription className="text-xs">
                                                    {institution.bic}
                                                </CardDescription>
                                            )}
                                        </div>
                                    </div>
                                    {connecting === institution.name ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Button size="sm" variant="ghost">
                                            Connetti →
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                        </Card>
                    ))
                )}
            </div>

            {/* Footer Info */}
            <div className="bg-muted text-muted-foreground rounded-lg p-3 text-xs">
                <p>
                    🔒 La connessione è sicura e conforme agli standard Open Banking. Le tue
                    credenziali non vengono mai condivise con noi.
                </p>
            </div>
        </div>
    )
}
