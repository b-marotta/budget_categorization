'use client'
import { useEffect, useState } from 'react'

import { RefreshCw } from 'lucide-react'

import { formatCurrency } from '@/lib/utils'
import { Account } from '@/types'

import LinkDrawer from '../link-drawer'
import { Button } from '../ui/button'

export default function BankList() {
    const [accounts, setAccounts] = useState<Account[]>([])
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            // Load accounts
            const accountsRes = await fetch('/api/accounts')
            const accountsData = await accountsRes.json()
            setAccounts(accountsData.accounts || [])
        } catch (error) {
            console.error('Failed to load data:', error)
        } finally {
            setLoading(false)
        }
    }

    const syncBank = async (bankId?: string) => {
        setSyncing(true)
        try {
            const res = await fetch('/api/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bankId ? { bank_id: bankId } : {}),
            })

            if (res.ok) {
                await loadData()
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

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <RefreshCw className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
        )
    }

    return accounts.length === 0 ? (
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
                            <div className="text-muted-foreground text-xs">{account.currency}</div>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => syncBank(account.bank.id)}
                            disabled={syncing}
                        >
                            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    )
}
