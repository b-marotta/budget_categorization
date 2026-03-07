'use client'

import { useEffect, useMemo, useState } from 'react'

import { RefreshCw } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Account, Transaction } from '@/types'

interface CategoryBreakdown {
    name: string
    amount: number
    color?: string
}

interface MonthlyNet {
    key: string
    label: string
    total: number
}

const MONTHS_TO_SHOW = 6

function getMonthKey(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function getMonthLabel(monthKey: string) {
    const [year, month] = monthKey.split('-').map(Number)
    return new Intl.DateTimeFormat('it-IT', { month: 'short' })
        .format(new Date(year, month - 1, 1))
        .replace('.', '')
}

function formatPercentage(value: number) {
    return new Intl.NumberFormat('it-IT', {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
    }).format(value)
}

export default function Home() {
    const [accounts, setAccounts] = useState<Account[]>([])
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = async () => {
        setLoading(true)
        try {
            const [accountsRes, transactionsRes] = await Promise.all([
                fetch('/api/accounts'),
                fetch('/api/transactions?limit=300'),
            ])

            const [accountsData, transactionsData] = await Promise.all([
                accountsRes.json(),
                transactionsRes.json(),
            ])

            setAccounts(accountsData.accounts || [])
            setTransactions(transactionsData.transactions || [])
        } catch (error) {
            console.error('Failed to load dashboard data:', error)
            setAccounts([])
            setTransactions([])
        } finally {
            setLoading(false)
        }
    }

    const totalBalance = useMemo(
        () => accounts.reduce((sum, account) => sum + account.current_balance, 0),
        [accounts],
    )

    const monthlyIncome = useMemo(() => {
        const now = new Date()
        const monthKey = getMonthKey(now)

        return transactions.reduce((sum, tx) => {
            const txMonthKey = getMonthKey(new Date(tx.transaction_date))
            if (txMonthKey !== monthKey || tx.amount <= 0) {
                return sum
            }
            return sum + tx.amount
        }, 0)
    }, [transactions])

    const monthlyExpenses = useMemo(() => {
        const now = new Date()
        const monthKey = getMonthKey(now)

        return transactions.reduce((sum, tx) => {
            const txMonthKey = getMonthKey(new Date(tx.transaction_date))
            if (txMonthKey !== monthKey || tx.amount >= 0) {
                return sum
            }
            return sum + Math.abs(tx.amount)
        }, 0)
    }, [transactions])

    const categoryBreakdown = useMemo<CategoryBreakdown[]>(() => {
        const categoryMap = new Map<string, CategoryBreakdown>()

        for (const tx of transactions) {
            if (tx.amount >= 0) {
                continue
            }

            const name = tx.category?.name || 'Non categorizzato'
            const current = categoryMap.get(name)

            if (current) {
                current.amount += Math.abs(tx.amount)
            } else {
                categoryMap.set(name, {
                    name,
                    amount: Math.abs(tx.amount),
                    color: tx.category?.color,
                })
            }
        }

        const allCategories = Array.from(categoryMap.values())
        const uncategorized = allCategories.find((item) => item.name === 'Non categorizzato')
        const categorized = allCategories
            .filter((item) => item.name !== 'Non categorizzato')
            .sort((a, b) => b.amount - a.amount)

        if (!uncategorized) {
            return categorized.slice(0, 6)
        }

        return [...categorized.slice(0, 5), uncategorized]
    }, [transactions])

    const monthlyTrend = useMemo<MonthlyNet[]>(() => {
        const monthTotals = new Map<string, number>()
        const baseDate = new Date()
        const monthKeys: string[] = []

        for (let i = MONTHS_TO_SHOW - 1; i >= 0; i--) {
            const date = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1)
            const key = getMonthKey(date)
            monthKeys.push(key)
            monthTotals.set(key, 0)
        }

        for (const tx of transactions) {
            const key = getMonthKey(new Date(tx.transaction_date))
            if (monthTotals.has(key)) {
                monthTotals.set(key, (monthTotals.get(key) || 0) + tx.amount)
            }
        }

        return monthKeys.map((key) => ({
            key,
            label: getMonthLabel(key),
            total: monthTotals.get(key) || 0,
        }))
    }, [transactions])

    const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions])

    const defaultCurrency = accounts[0]?.currency || transactions[0]?.currency || 'EUR'
    const maxCategoryAmount = categoryBreakdown[0]?.amount || 0
    const totalCategoryAmount = categoryBreakdown.reduce((sum, item) => sum + item.amount, 0)
    const maxTrendAbs = Math.max(...monthlyTrend.map((item) => Math.abs(item.total)), 1)
    const expenseRate = monthlyIncome > 0 ? monthlyExpenses / monthlyIncome : 0
    const savingsRate =
        monthlyIncome > 0
            ? (monthlyIncome - monthlyExpenses) / monthlyIncome
            : monthlyExpenses > 0
              ? -1
              : 0

    if (loading) {
        return (
            <main className="flex h-full w-full items-center justify-center">
                <RefreshCw className="text-muted-foreground h-8 w-8 animate-spin" />
            </main>
        )
    }

    return (
        <main className="flex h-full w-full flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Panoramica</h1>
                <Badge variant="secondary">{accounts.length} conti</Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardDescription>Saldo totale</CardDescription>
                        <CardTitle className="text-2xl">
                            {formatCurrency(totalBalance, defaultCurrency)}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Entrate mese</CardDescription>
                        <CardTitle className="text-2xl text-green-600">
                            {formatCurrency(monthlyIncome, defaultCurrency)}
                        </CardTitle>
                        <CardDescription>
                            Tasso risparmio: {formatPercentage(savingsRate)}
                        </CardDescription>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Uscite mese</CardDescription>
                        <CardTitle className="text-2xl text-red-600">
                            {formatCurrency(monthlyExpenses, defaultCurrency)}
                        </CardTitle>
                        <CardDescription>
                            Incidenza su entrate: {formatPercentage(expenseRate)}
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Spese per categoria</CardTitle>
                        <CardDescription>Top 6 categorie per importo</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {categoryBreakdown.length === 0 ? (
                            <p className="text-muted-foreground text-sm">
                                Nessuna spesa disponibile.
                            </p>
                        ) : (
                            categoryBreakdown.map((item) => {
                                const width = maxCategoryAmount
                                    ? Math.round((item.amount / maxCategoryAmount) * 100)
                                    : 0

                                return (
                                    <div key={item.name} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="truncate">{item.name}</span>
                                            <div className="ml-2 text-right">
                                                <div className="font-medium">
                                                    {formatCurrency(item.amount, defaultCurrency)}
                                                </div>
                                                <div className="text-muted-foreground text-xs">
                                                    {formatPercentage(
                                                        totalCategoryAmount > 0
                                                            ? item.amount / totalCategoryAmount
                                                            : 0,
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-muted h-2 rounded-full">
                                            <div
                                                className="h-2 rounded-full"
                                                style={{
                                                    width: `${Math.max(width, 4)}%`,
                                                    backgroundColor:
                                                        item.color || 'hsl(var(--primary))',
                                                }}
                                            />
                                        </div>
                                    </div>
                                )
                            })
                        )}
                        {categoryBreakdown.length > 0 && (
                            <p className="text-muted-foreground pt-1 text-xs">
                                Le categorie mostrate coprono il{' '}
                                {formatPercentage(
                                    monthlyExpenses > 0 ? totalCategoryAmount / monthlyExpenses : 0,
                                )}{' '}
                                delle uscite del mese.
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Andamento 6 mesi</CardTitle>
                        <CardDescription>Netto mensile (entrate - uscite)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex h-44 items-end gap-2">
                            {monthlyTrend.map((item) => {
                                const barHeight = Math.max(
                                    8,
                                    Math.round((Math.abs(item.total) / maxTrendAbs) * 100),
                                )

                                return (
                                    <div
                                        key={item.key}
                                        className="flex flex-1 flex-col items-center gap-2"
                                    >
                                        <div
                                            className={`w-full rounded-md ${item.total >= 0 ? 'bg-green-600/80' : 'bg-red-600/80'}`}
                                            style={{ height: `${barHeight}%` }}
                                            title={formatCurrency(item.total, defaultCurrency)}
                                        />
                                        <span className="text-muted-foreground text-xs">
                                            {item.label}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Ultime transazioni</CardTitle>
                    <CardDescription>Movimenti più recenti</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {recentTransactions.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                            Nessuna transazione trovata.
                        </p>
                    ) : (
                        recentTransactions.map((txn) => (
                            <div
                                key={txn.id}
                                className="hover:bg-muted/60 flex items-center justify-between rounded-md border p-3"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="truncate font-medium">{txn.description}</div>
                                    <div className="text-muted-foreground truncate text-xs">
                                        {new Date(txn.transaction_date).toLocaleDateString('it-IT')}{' '}
                                        · {txn.account.bank.institution_name}
                                    </div>
                                </div>
                                <div
                                    className={`ml-3 text-sm font-semibold ${txn.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}
                                >
                                    {txn.amount > 0 ? '+' : ''}
                                    {formatCurrency(txn.amount, txn.currency)}
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </main>
    )
}
