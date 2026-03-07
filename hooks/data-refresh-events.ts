export const REFETCH_TARGETS = {
    accounts: 'accounts',
    categories: 'categories',
    transactions: 'transactions',
} as const

export type RefetchTarget = (typeof REFETCH_TARGETS)[keyof typeof REFETCH_TARGETS]

interface RefetchFinanceDataOptions {
    accounts?: boolean
    categories?: boolean
    transactions?: boolean
}

type DataRefreshListener = (targets: RefetchTarget[]) => void

const listeners = new Set<DataRefreshListener>()

export function subscribeDataRefresh(listener: DataRefreshListener) {
    listeners.add(listener)

    return () => {
        listeners.delete(listener)
    }
}

export function emitDataRefresh(targets: RefetchTarget[]) {
    for (const listener of listeners) {
        listener(targets)
    }
}

export function refetchFinanceData(options: RefetchFinanceDataOptions) {
    const targets = new Set<RefetchTarget>()

    if (options.accounts) {
        targets.add(REFETCH_TARGETS.accounts)
    }

    if (options.categories) {
        targets.add(REFETCH_TARGETS.categories)
    }

    if (options.transactions) {
        targets.add(REFETCH_TARGETS.transactions)
    }

    if (targets.size === 0) {
        return
    }

    emitDataRefresh(Array.from(targets))
}
