'use client'

import { useEffect } from 'react'

import { create } from 'zustand'

import { REFETCH_TARGETS, subscribeDataRefresh } from '@/hooks/data-refresh-events'
import { Transaction } from '@/types'

interface TransactionsStoreState {
    transactions: Transaction[]
    loading: boolean
    initialized: boolean
    refetch: () => Promise<Transaction[]>
}

const useTransactionsStore = create<TransactionsStoreState>((set) => ({
    transactions: [],
    loading: false,
    initialized: false,
    refetch: async () => {
        set({ loading: true })

        const response = await fetch('/api/transactions')
        const payload = await response.json()
        const transactions = (payload.transactions || []) as Transaction[]

        set({
            transactions,
            loading: false,
            initialized: true,
        })

        return transactions
    },
}))

interface UseTransactionsDataOptions {
    autoLoad?: boolean
}

export function useTransactionsData({ autoLoad = true }: UseTransactionsDataOptions = {}) {
    const transactions = useTransactionsStore((state) => state.transactions)
    const loading = useTransactionsStore((state) => state.loading)
    const initialized = useTransactionsStore((state) => state.initialized)
    const refetch = useTransactionsStore((state) => state.refetch)

    useEffect(() => {
        if (!autoLoad || initialized || loading) {
            return
        }

        refetch().catch((error) => {
            console.error('Failed to load transactions:', error)
        })
    }, [autoLoad, initialized, loading, refetch])

    useEffect(() => {
        return subscribeDataRefresh((targets) => {
            if (!targets.includes(REFETCH_TARGETS.transactions)) {
                return
            }

            refetch().catch((error) => {
                console.error('Failed to refresh transactions:', error)
            })
        })
    }, [refetch])

    return { transactions, loading, refetch, initialized }
}
