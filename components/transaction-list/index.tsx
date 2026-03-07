'use client'

import { RefreshCw } from 'lucide-react'

import { refetchFinanceData } from '@/hooks/data-refresh-events'
import { useCategoriesData } from '@/hooks/use-categories-data'
import { useTransactionsData } from '@/hooks/use-transactions-data'
import { formatCurrency } from '@/lib/utils'

import { CategorySelect } from './category-select'

export default function TransactionList() {
    const {
        transactions,
        loading: transactionsLoading,
        refetch: refetchTransactions,
    } = useTransactionsData()
    const { categories, loading: categoriesLoading } = useCategoriesData()
    const loading = transactionsLoading || categoriesLoading

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

    const getTransactionDateLabel = (dateStr: string) => {
        const transactionDate = new Date(dateStr)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(today.getDate() - 1)
        const startOfToday = new Date(today.setHours(0, 0, 0, 0))
        const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0))

        if (transactionDate.getTime() === startOfToday.getTime()) {
            return 'Oggi'
        }

        if (transactionDate.getTime() === startOfYesterday.getTime()) {
            return 'Ieri'
        }

        return transactionDate.toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
        })
    }

    return (
        <div className="flex h-full flex-col">
            {transactions.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground text-sm">Nessuna transazione trovata.</p>
                </div>
            ) : (
                <div className="h-full space-y-4 pr-1">
                    {transactions.map((txn) => (
                        <div
                            key={txn.id}
                            className="hover:bg-muted/50 mb-4 flex items-stretch justify-between border-b pb-4"
                        >
                            <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 pr-3">
                                <p className="text-muted-foreground text-xs">
                                    {getTransactionDateLabel(txn.transaction_date)}
                                    {' · '}
                                    {new Date(txn.transaction_date).toLocaleTimeString('it-IT', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                    {txn.is_pending ? (
                                        <>
                                            {' · '}
                                            <span className="text-blue-600">In sospeso</span>
                                        </>
                                    ) : null}
                                </p>

                                <div className="flex items-center gap-2">
                                    <p className="line-clamp-3 [display:-webkit-box] overflow-hidden text-sm font-medium wrap-break-word">
                                        {txn.description}
                                    </p>
                                </div>
                                <div className="text-muted-foreground truncate text-xs">
                                    {txn.account.bank.institution_name} · {txn.account.name}
                                </div>
                            </div>
                            <div className="flex shrink-0 flex-col justify-between gap-3">
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
                </div>
            )}
        </div>
    )
}
