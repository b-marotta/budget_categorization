import { SupabaseClient } from '@supabase/supabase-js'

import type { EnableBankingClient, PSUContext } from './enable-banking.client'
import type { HalTransactions, Transaction } from './enable-banking.types'

interface SyncableBank {
    id: string
    access_token: string
}

interface SyncBankDataOptions {
    supabase: SupabaseClient
    client: EnableBankingClient
    bank: SyncableBank
    userId: string
    psu?: PSUContext
    accountId?: string
    continuationKey?: string
    dateFrom?: string
    dateTo?: string
    manualCursorMode?: boolean
    maxPagesPerAccount?: number
}

interface SyncPaginationItem {
    bank_id: string
    account_id: string
    continuation_key: string
}

interface SyncBankDataResult {
    accountsSynced: number
    transactionsSynced: number
    pagination: SyncPaginationItem[]
}

const BALANCE_PRIORITY: string[] = [
    'CLAV',
    'ITAV',
    'CLBD',
    'ITBD',
    'OPAV',
    'OPBD',
    'PRCD',
    'FWAV',
    'VALU',
    'INFO',
    'OTHR',
    'XPCD',
]

function pickBestBalanceAmount(
    balances: Array<{ balance_type: string; balance_amount: { amount: string } }>,
): number {
    for (const balanceType of BALANCE_PRIORITY) {
        const match = balances.find((balance) => balance.balance_type === balanceType)
        if (!match) {
            continue
        }

        const parsed = parseFloat(match.balance_amount.amount)
        if (!Number.isNaN(parsed)) {
            return parsed
        }
    }

    const fallback = balances[0]
    if (!fallback) {
        return 0
    }

    const parsedFallback = parseFloat(fallback.balance_amount.amount)
    return Number.isNaN(parsedFallback) ? 0 : parsedFallback
}

function getTransactionDate(transaction: Transaction): string {
    return (
        transaction.booking_date ||
        transaction.value_date ||
        transaction.transaction_date ||
        new Date().toISOString().split('T')[0]
    )
}

function buildExternalId(transaction: Transaction, accountId: string): string {
    const directId =
        transaction.entry_reference || transaction.transaction_id || transaction.reference_number
    if (directId) {
        return directId
    }

    const syntheticParts = [
        accountId,
        transaction.status || 'UNKNOWN',
        getTransactionDate(transaction),
        transaction.transaction_amount.currency || '',
        transaction.transaction_amount.amount || '',
        transaction.credit_debit_indicator || '',
        transaction.creditor?.name || transaction.debtor?.name || '',
        (transaction.remittance_information || []).join('|'),
    ]

    return `synthetic:${syntheticParts.join(':')}`
}

function extractTransactions(txnData: HalTransactions): Transaction[] {
    const raw = txnData as HalTransactions & {
        booked?: Transaction[]
        pending?: Transaction[]
    }

    const merged = [
        ...(Array.isArray(raw.transactions) ? raw.transactions : []),
        ...(Array.isArray(raw.booked) ? raw.booked : []),
        ...(Array.isArray(raw.pending) ? raw.pending : []),
    ]

    return merged
}

function extractIbanFromAccountDetails(accountDetails: {
    account_id?: {
        iban?: string
        other?: { identification?: string; scheme_name?: string }
    }
    all_account_ids?: Array<{ identification?: string; scheme_name?: string }>
}): string | undefined {
    if (accountDetails.account_id?.iban) {
        return accountDetails.account_id.iban
    }

    const other = accountDetails.account_id?.other
    if (other?.scheme_name === 'IBAN' && other.identification) {
        return other.identification
    }

    const ibanId = accountDetails.all_account_ids?.find(
        (item) => item.scheme_name === 'IBAN' && typeof item.identification === 'string',
    )

    return ibanId?.identification
}

function extractNameFromAccountDetails(accountDetails: {
    name?: string
    details?: string
    product?: string
}): string {
    return accountDetails.name || accountDetails.product || accountDetails.details || 'Account'
}

export async function syncBankData(options: SyncBankDataOptions): Promise<SyncBankDataResult> {
    const {
        supabase,
        client,
        bank,
        userId,
        psu,
        accountId,
        continuationKey,
        dateFrom,
        dateTo,
        manualCursorMode = false,
        maxPagesPerAccount = 50,
    } = options

    let accountsSynced = 0
    let transactionsSynced = 0
    const pagination: SyncPaginationItem[] = []

    const sessionData = await client.getSession(bank.access_token)
    const accounts = sessionData.accounts_data || []
    const accountsToSync = accountId
        ? accounts.filter((account: { uid: string }) => account.uid === accountId)
        : accounts

    if (accountId && accountsToSync.length === 0) {
        return {
            accountsSynced,
            transactionsSynced,
            pagination,
        }
    }

    for (const account of accountsToSync) {
        let accountName = 'Account'
        let accountCurrency = 'EUR'
        let accountIban: string | undefined

        try {
            const accountDetails = await client.getAccountDetails(account.uid, psu)
            accountName = extractNameFromAccountDetails(accountDetails)
            accountCurrency = accountDetails.currency || accountCurrency
            accountIban = extractIbanFromAccountDetails(accountDetails)
        } catch (accountDetailsError) {
            console.error('Failed to fetch account details:', accountDetailsError)
        }

        let balance = 0
        try {
            const balancesData = await client.getAccountBalances(account.uid, psu)
            balance = pickBestBalanceAmount(balancesData.balances)
        } catch (balanceError) {
            console.error('Failed to fetch balance:', balanceError)
        }

        const { data: dbAccount, error: accountError } = await supabase
            .from('accounts')
            .upsert(
                {
                    bank_id: bank.id,
                    external_account_id: account.uid,
                    name: accountName,
                    iban: accountIban,
                    currency: accountCurrency,
                    current_balance: balance,
                },
                {
                    onConflict: 'bank_id,external_account_id',
                },
            )
            .select()
            .single()

        if (accountError || !dbAccount) {
            console.error('Failed to sync account:', accountError)
            continue
        }

        accountsSynced++

        const defaultDateFrom = new Date()
        defaultDateFrom.setDate(defaultDateFrom.getDate() - 90)
        const defaultDateTo = new Date()

        const selectedDateFrom =
            typeof dateFrom === 'string' && dateFrom.length > 0
                ? dateFrom
                : defaultDateFrom.toISOString().split('T')[0]
        const selectedDateTo =
            typeof dateTo === 'string' && dateTo.length > 0
                ? dateTo
                : defaultDateTo.toISOString().split('T')[0]

        let nextContinuationKey =
            accountId === account.uid && typeof continuationKey === 'string'
                ? continuationKey
                : undefined
        const seenContinuationKeys = new Set<string>()

        for (let pageIndex = 0; pageIndex < maxPagesPerAccount; pageIndex++) {
            const txnData = await client.getAccountTransactions(
                account.uid,
                selectedDateFrom,
                selectedDateTo,
                psu,
                nextContinuationKey,
            )

            const transactions = extractTransactions(txnData)

            const transactionRecords = transactions.map((transaction) => ({
                user_id: userId,
                account_id: dbAccount.id,
                external_id: buildExternalId(transaction, account.uid),
                description:
                    transaction.remittance_information?.join(' ') ||
                    transaction.creditor?.name ||
                    transaction.debtor?.name ||
                    'Unknown',
                amount:
                    parseFloat(transaction.transaction_amount.amount) *
                    (transaction.credit_debit_indicator === 'DBIT' ? -1 : 1),
                currency: transaction.transaction_amount.currency,
                transaction_date: getTransactionDate(transaction),
                raw: transaction,
            }))

            const externalIds = transactionRecords
                .map((record) => record.external_id)
                .filter((externalId) => externalId.length > 0)
            const uniqueExternalIds = [...new Set(externalIds)]

            let existingExternalIds = new Set<string>()
            if (uniqueExternalIds.length > 0) {
                const { data: existingTransactions, error: existingError } = await supabase
                    .from('transactions')
                    .select('external_id')
                    .eq('account_id', dbAccount.id)
                    .in('external_id', uniqueExternalIds)

                if (existingError) {
                    console.error('Failed to check existing transactions:', existingError)
                } else {
                    existingExternalIds = new Set(
                        (existingTransactions || [])
                            .map((row: { external_id: string | null }) => row.external_id)
                            .filter(
                                (externalId: string | null): externalId is string =>
                                    typeof externalId === 'string',
                            ),
                    )
                }
            }

            const newTransactionRecords = transactionRecords.filter((record) => {
                if (!record.external_id) {
                    return true
                }

                return !existingExternalIds.has(record.external_id)
            })

            if (newTransactionRecords.length > 0) {
                const { error: transactionError } = await supabase
                    .from('transactions')
                    .upsert(newTransactionRecords, {
                        onConflict: 'account_id,external_id',
                        ignoreDuplicates: true,
                    })

                if (transactionError) {
                    console.error('Failed to sync transactions:', transactionError)
                } else {
                    transactionsSynced += newTransactionRecords.length
                }
            }

            const hasMore = Boolean(txnData.continuation_key)
            if (!hasMore) {
                break
            }

            if (manualCursorMode) {
                pagination.push({
                    bank_id: bank.id,
                    account_id: account.uid,
                    continuation_key: txnData.continuation_key!,
                })
                break
            }

            if (newTransactionRecords.length === 0) {
                break
            }

            const newContinuationKey = txnData.continuation_key!
            if (seenContinuationKeys.has(newContinuationKey)) {
                pagination.push({
                    bank_id: bank.id,
                    account_id: account.uid,
                    continuation_key: newContinuationKey,
                })
                break
            }

            seenContinuationKeys.add(newContinuationKey)
            nextContinuationKey = newContinuationKey

            if (pageIndex === maxPagesPerAccount - 1) {
                pagination.push({
                    bank_id: bank.id,
                    account_id: account.uid,
                    continuation_key: newContinuationKey,
                })
            }
        }
    }

    await supabase
        .from('banks')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', bank.id)

    return {
        accountsSynced,
        transactionsSynced,
        pagination,
    }
}
