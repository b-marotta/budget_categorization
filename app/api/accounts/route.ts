import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/accounts
 * Get user's accounts with balances
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

        const { data: accounts, error } = await supabase
            .from('accounts')
            .select(
                `
        *,
        bank:banks!inner(
          id,
          institution_name,
          status
        )
      `,
            )
            .eq('bank.user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            throw error
        }

        return NextResponse.json({ accounts })
    } catch (error) {
        console.error('Failed to fetch accounts:', error)
        return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 })
    }
}
