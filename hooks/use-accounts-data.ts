'use client'

import { useEffect } from 'react'

import { create } from 'zustand'

import { REFETCH_TARGETS, subscribeDataRefresh } from '@/hooks/data-refresh-events'
import { Account } from '@/types'

interface AccountsStoreState {
    accounts: Account[]
    loading: boolean
    initialized: boolean
    refetch: () => Promise<Account[]>
}

const useAccountsStore = create<AccountsStoreState>((set) => ({
    accounts: [],
    loading: false,
    initialized: false,
    refetch: async () => {
        set({ loading: true })

        const response = await fetch('/api/accounts')
        const payload = await response.json()
        const accounts = (payload.accounts || []) as Account[]

        set({
            accounts,
            loading: false,
            initialized: true,
        })

        return accounts
    },
}))

interface UseAccountsDataOptions {
    autoLoad?: boolean
}

export function useAccountsData({ autoLoad = true }: UseAccountsDataOptions = {}) {
    const accounts = useAccountsStore((state) => state.accounts)
    const loading = useAccountsStore((state) => state.loading)
    const initialized = useAccountsStore((state) => state.initialized)
    const refetch = useAccountsStore((state) => state.refetch)

    useEffect(() => {
        if (!autoLoad || initialized || loading) {
            return
        }

        refetch().catch((error) => {
            console.error('Failed to load accounts:', error)
        })
    }, [autoLoad, initialized, loading, refetch])

    useEffect(() => {
        return subscribeDataRefresh((targets) => {
            if (!targets.includes(REFETCH_TARGETS.accounts)) {
                return
            }

            refetch().catch((error) => {
                console.error('Failed to refresh accounts:', error)
            })
        })
    }, [refetch])

    return { accounts, loading, refetch, initialized }
}
