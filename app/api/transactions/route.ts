import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

function getTransactionPendingState(raw: unknown): boolean {
    if (!raw || typeof raw !== 'object') {
        return false
    }

    const rawStatus = (raw as { status?: unknown }).status
    if (typeof rawStatus !== 'string') {
        return false
    }

    const normalizedStatus = rawStatus.toUpperCase()

    return normalizedStatus.includes('PENDING') || normalizedStatus === 'PDNG'
}

/**
 * GET /api/transactions
 * Get user's transactions with filters
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const searchParams = request.nextUrl.searchParams
        const accountId = searchParams.get('account_id')
        const categoryId = searchParams.get('category_id')
        const dateFrom = searchParams.get('date_from')
        const dateTo = searchParams.get('date_to')
        const limitParam = searchParams.get('limit')
        const limit = limitParam ? parseInt(limitParam, 10) : null

        let query = supabase
            .from('transactions')
            .select(
                `
        *,
        account:accounts!inner(
          id,
          name,
          iban,
          bank:banks!inner(
            institution_name
          )
        )
          `,
            )
            .eq('user_id', user.id)
            .order('transaction_date', { ascending: false })
            .order('id', { ascending: false })

        if (accountId) {
            query = query.eq('account_id', accountId)
        }

        if (categoryId) {
            query = query.eq('category_id', categoryId)
        }

        if (dateFrom) {
            query = query.gte('transaction_date', dateFrom)
        }

        if (dateTo) {
            query = query.lte('transaction_date', dateTo)
        }

        if (typeof limit === 'number' && Number.isFinite(limit) && limit > 0) {
            query = query.limit(limit)
        }

        const { data: transactions, error } = await query

        if (error) {
            throw error
        }

        // Enrich transactions with category data from appropriate table
        if (transactions) {
            const enrichedTransactions = await Promise.all(
                transactions.map(async (tx) => {
                    const isPending = getTransactionPendingState(tx.raw)

                    if (!tx.category_id || !tx.category_type) {
                        return { ...tx, category: null, is_pending: isPending }
                    }

                    const tableName =
                        tx.category_type === 'system' ? 'system_categories' : 'user_categories'
                    const { data: category } = await supabase
                        .from(tableName)
                        .select('id, name, color, icon')
                        .eq('id', tx.category_id)
                        .single()

                    return { ...tx, category, is_pending: isPending }
                }),
            )

            return NextResponse.json({ transactions: enrichedTransactions })
        }

        return NextResponse.json({ transactions })
    } catch (error) {
        console.error('Failed to fetch transactions:', error)
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
    }
}

/**
 * PATCH /api/transactions/:id
 * Update transaction (e.g., assign category)
 */
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const transactionId = request.nextUrl.searchParams.get('id')
        if (!transactionId) {
            return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 })
        }

        const body = await request.json()
        const { category_id, category_type } = body

        // Determine category type based on which table to check
        let actualCategoryType = category_type
        if (!actualCategoryType && category_id) {
            // Auto-detect if not provided
            const { data: systemCat } = await supabase
                .from('system_categories')
                .select('id')
                .eq('id', category_id)
                .single()

            actualCategoryType = systemCat ? 'system' : 'user'
        }

        const { data: transaction, error } = await supabase
            .from('transactions')
            .update({
                category_id: category_id || null,
                category_type: actualCategoryType || null,
            })
            .eq('id', transactionId)
            .eq('user_id', user.id)
            .select()
            .single()

        if (error) {
            throw error
        }

        return NextResponse.json({ transaction })
    } catch (error) {
        console.error('Failed to update transaction:', error)
        return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 })
    }
}
