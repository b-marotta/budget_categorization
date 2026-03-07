'use client'
import { useEffect, useState } from 'react'

import { RefreshCw, X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { refetchFinanceData } from '@/hooks/data-refresh-events'
import { useAccountsData } from '@/hooks/use-accounts-data'
import { formatCurrency } from '@/lib/utils'

import LinkDrawer from '../link-drawer'
import { Button } from '../ui/button'

export default function BankList() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    const { accounts, loading, refetch: refetchAccounts } = useAccountsData()
    const [syncing, setSyncing] = useState(false)

    const successParam = searchParams.get('success')
    const errorParam = searchParams.get('error')
    const isBankConnected = successParam === 'bank_connected'

    useEffect(() => {
        if (isBankConnected) {
            refetchAccounts().catch((error) => {
                console.error('Failed to refresh accounts after bank link:', error)
            })
        }
    }, [isBankConnected, refetchAccounts])

    const syncBank = async (bankId?: string) => {
        setSyncing(true)
        try {
            const res = await fetch('/api/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bankId ? { bank_id: bankId } : {}),
            })

            if (res.ok) {
                refetchFinanceData({
                    accounts: true,
                    transactions: true,
                })
                await refetchAccounts()
            } else {
                const error = await res.json()
                console.error('Sync failed:', error)
                alert(
                    'Errore durante la sincronizzazione: ' + (error.error || 'Errore sconosciuto'),
                )
            }
        } catch (error) {
            console.error('Sync failed:', error)
            alert('Errore durante la sincronizzazione')
        } finally {
            setSyncing(false)
        }
    }

    const clearStatusParams = () => {
        router.replace(pathname)
    }

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <RefreshCw className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="w-full space-y-4">
            {isBankConnected && (
                <div className="rounded-lg border border-green-600 bg-green-50/50 p-3 text-sm text-green-600">
                    <div className="flex items-center justify-between gap-2">
                        <span>
                            <span className="font-semibold">Banca collegata con successo!</span>
                            <br />I dati sono ora aggiornati con le nuove transazioni
                        </span>
                        <Button
                            className="[&_svg]:size-6"
                            size="sm"
                            variant="ghost"
                            onClick={clearStatusParams}
                        >
                            <X size="8" />
                        </Button>
                    </div>
                </div>
            )}

            {errorParam && (
                <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                        <span>Errore durante il collegamento della banca: {errorParam}</span>
                        <Button
                            className="[&_svg]:size-6"
                            size="sm"
                            variant="ghost"
                            onClick={clearStatusParams}
                        >
                            <X size="8" />
                        </Button>
                    </div>
                </div>
            )}

            {accounts.length === 0 ? (
                <div className="flex flex-col items-center gap-4">
                    <p className="text-muted-foreground text-center text-sm">
                        Nessun conto connesso. Connetti la tua banca per iniziare.
                    </p>

                    <LinkDrawer />
                </div>
            ) : (
                <div className="w-full space-y-4">
                    {accounts.map((account) => (
                        <div
                            key={account.id}
                            className="flex w-full items-center justify-between rounded-lg border p-4"
                        >
                            <div className="flex-1">
                                <div className="font-medium">{account.name || account.iban}</div>
                                <div className="text-muted-foreground text-sm">
                                    {account.bank.institution_name}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <div className="font-bold">
                                        {formatCurrency(account.current_balance, account.currency)}
                                    </div>
                                    <div className="text-muted-foreground text-xs">
                                        {account.currency}
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => syncBank(account.bank.id)}
                                    disabled={syncing}
                                >
                                    <RefreshCw
                                        className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`}
                                    />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
