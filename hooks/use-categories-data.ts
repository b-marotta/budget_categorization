'use client'

import { useEffect } from 'react'

import { create } from 'zustand'

import { REFETCH_TARGETS, subscribeDataRefresh } from '@/hooks/data-refresh-events'
import { Category } from '@/types'

interface CategoriesStoreState {
    categories: Category[]
    loading: boolean
    initialized: boolean
    refetch: () => Promise<Category[]>
}

const useCategoriesStore = create<CategoriesStoreState>((set) => ({
    categories: [],
    loading: false,
    initialized: false,
    refetch: async () => {
        set({ loading: true })

        const response = await fetch('/api/categories')
        const payload = await response.json()
        const categories = (payload.categories || []) as Category[]

        set({
            categories,
            loading: false,
            initialized: true,
        })

        return categories
    },
}))

interface UseCategoriesDataOptions {
    autoLoad?: boolean
}

export function useCategoriesData({ autoLoad = true }: UseCategoriesDataOptions = {}) {
    const categories = useCategoriesStore((state) => state.categories)
    const loading = useCategoriesStore((state) => state.loading)
    const initialized = useCategoriesStore((state) => state.initialized)
    const refetch = useCategoriesStore((state) => state.refetch)

    useEffect(() => {
        if (!autoLoad || initialized || loading) {
            return
        }

        refetch().catch((error) => {
            console.error('Failed to load categories:', error)
        })
    }, [autoLoad, initialized, loading, refetch])

    useEffect(() => {
        return subscribeDataRefresh((targets) => {
            if (!targets.includes(REFETCH_TARGETS.categories)) {
                return
            }

            refetch().catch((error) => {
                console.error('Failed to refresh categories:', error)
            })
        })
    }, [refetch])

    return { categories, loading, refetch, initialized }
}
