'use client'

import { useMemo } from 'react'

import { RefreshCw } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { refetchFinanceData } from '@/hooks/data-refresh-events'
import { useCategoriesData } from '@/hooks/use-categories-data'
import { useTransactionsData } from '@/hooks/use-transactions-data'
import { formatCurrency } from '@/lib/utils'
import { Transaction } from '@/types'

import { CategorySelect } from './category-select'

const TRANSACTION_LIST_VISIBLE_ROWS = 50

function getDateGroupLabel(dateKey: string) {
    const transactionDate = new Date(`${dateKey}T00:00:00`)
    const today = new Date()
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const startOfYesterday = new Date(startOfToday)
    startOfYesterday.setDate(startOfYesterday.getDate() - 1)

    if (transactionDate.getTime() === startOfToday.getTime()) {
        return 'Oggi'
    }

    if (transactionDate.getTime() === startOfYesterday.getTime()) {
        return 'Ieri'
    }

    const isCurrentYear = transactionDate.getFullYear() === today.getFullYear()

    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        ...(isCurrentYear ? {} : { year: 'numeric' }),
    }).format(transactionDate)
}

export default function TransactionList() {
    const {
        transactions,
        loading: transactionsLoading,
        refetch: refetchTransactions,
    } = useTransactionsData()
    const { categories, loading: categoriesLoading } = useCategoriesData()
    const loading = transactionsLoading || categoriesLoading

    const groupedTransactions = useMemo(() => {
        const groups = new Map<string, Transaction[]>()
        const visibleTransactions = transactions.slice(0, TRANSACTION_LIST_VISIBLE_ROWS)

        for (const txn of visibleTransactions) {
            const dateKey = txn.transaction_date.split('T')[0]
            const group = groups.get(dateKey)

            if (group) {
                group.push(txn)
            } else {
                groups.set(dateKey, [txn])
            }
        }

        return Array.from(groups.entries()).map(([dateKey, items]) => ({
            dateKey,
            label: getDateGroupLabel(dateKey),
            items,
        }))
    }, [transactions])

    const reloadTransactions = async () => {
        try {
            await refetchTransactions()
            refetchFinanceData({ transactions: true })
        } catch (error) {
            console.error('Failed to refresh transactions:', error)
        }
    }

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <RefreshCw className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="flex h-full flex-col">
            {transactions.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground text-sm">Nessuna transazione trovata.</p>
                </div>
            ) : (
                <div className="h-full space-y-4 pr-1">
                    {groupedTransactions.map((group) => (
                        <section key={group.dateKey} className="space-y-2">
                            <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                                {group.label}
                            </h3>
                            {group.items.map((txn) => (
                                <div
                                    key={txn.id}
                                    className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <div className="font-medium">{txn.description}</div>
                                            {txn.is_pending ? (
                                                <Badge variant="outline">In sospeso</Badge>
                                            ) : null}
                                        </div>
                                        <div className="text-muted-foreground text-xs">
                                            {txn.account.bank.institution_name} · {txn.account.name}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <div
                                            className={`text-right font-bold ${
                                                txn.amount > 0 ? 'text-green-600' : 'text-red-600'
                                            }`}
                                        >
                                            {txn.amount > 0 ? '+' : ''}
                                            {formatCurrency(txn.amount, txn.currency)}
                                        </div>
                                        <CategorySelect
                                            transactionId={txn.id}
                                            currentCategoryId={txn.category?.id}
                                            transactionAmount={txn.amount}
                                            categories={categories}
                                            onUpdate={reloadTransactions}
                                        />
                                    </div>
                                </div>
                            ))}
                        </section>
                    ))}
                </div>
            )}
        </div>
    )
}
