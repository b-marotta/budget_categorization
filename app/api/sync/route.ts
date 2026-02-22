import { NextRequest, NextResponse } from 'next/server'

import { createEnableBankingClient, extractPSUContext, syncBankData } from '@/lib/enable-banking'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/sync
 * Sync accounts and transactions from Enable Banking
 */
export async function POST(request: NextRequest) {
    try {
        const psu = extractPSUContext(request.headers)
        const supabase = await createClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { bank_id, account_id, continuation_key, date_from, date_to } = body
        const isManualCursorMode =
            typeof continuation_key === 'string' && continuation_key.length > 0

        if (continuation_key && !account_id) {
            return NextResponse.json(
                { error: 'account_id is required when using continuation_key' },
                { status: 400 },
            )
        }

        // Get bank(s) to sync
        let banksQuery = supabase
            .from('banks')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')

        if (bank_id) {
            banksQuery = banksQuery.eq('id', bank_id)
        }

        const { data: banks, error: banksError } = await banksQuery

        if (banksError || !banks || banks.length === 0) {
            return NextResponse.json({ error: 'No banks to sync' }, { status: 404 })
        }

        const client = createEnableBankingClient()
        let totalAccountsSynced = 0
        let totalTransactionsSynced = 0
        const pagination: Array<{
            bank_id: string
            account_id: string
            continuation_key: string
        }> = []

        // Sync each bank
        for (const bank of banks) {
            if (!bank.access_token) {
                console.error(`Bank ${bank.id} missing access_token`)
                continue
            }

            try {
                const syncResult = await syncBankData({
                    supabase,
                    client,
                    bank: {
                        id: bank.id,
                        access_token: bank.access_token,
                    },
                    userId: user.id,
                    psu,
                    accountId: account_id,
                    continuationKey: continuation_key,
                    dateFrom: date_from,
                    dateTo: date_to,
                    manualCursorMode: isManualCursorMode,
                })

                totalAccountsSynced += syncResult.accountsSynced
                totalTransactionsSynced += syncResult.transactionsSynced
                pagination.push(...syncResult.pagination)
            } catch (bankSyncError) {
                console.error(`Failed to sync bank ${bank.id}:`, bankSyncError)
                // Continue with next bank
            }
        }

        return NextResponse.json({
            success: true,
            banks_synced: banks.length,
            accounts_synced: totalAccountsSynced,
            transactions_synced: totalTransactionsSynced,
            pagination,
        })
    } catch (error) {
        console.error('Sync failed:', error)
        return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
    }
}

/**
 * GET /api/sync/status
 * Get sync status for user's banks
 */
export async function GET() {
    try {
        const supabase = await createClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: banks, error } = await supabase
            .from('banks')
            .select('id, institution_name, status, last_synced_at')
            .eq('user_id', user.id)

        if (error) {
            throw error
        }

        return NextResponse.json({ banks })
    } catch (error) {
        console.error('Failed to get sync status:', error)
        return NextResponse.json({ error: 'Failed to get sync status' }, { status: 500 })
    }
}
