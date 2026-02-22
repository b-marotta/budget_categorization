import { NextRequest, NextResponse } from 'next/server'

import { createEnableBankingClient, extractPSUContext, syncBankData } from '@/lib/enable-banking'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/banks/callback
 * OAuth callback from Enable Banking
 */
export async function GET(request: NextRequest) {
    try {
        const psu = extractPSUContext(request.headers)
        const searchParams = request.nextUrl.searchParams
        const code = searchParams.get('code')
        const state = searchParams.get('state') // user_id
        const error = searchParams.get('error')

        if (error) {
            console.error('Authorization error:', error)
            return NextResponse.redirect(
                `${request.nextUrl.origin}/dashboard?error=bank_connection_failed`,
            )
        }

        if (!code || !state) {
            return NextResponse.redirect(
                `${request.nextUrl.origin}/dashboard?error=invalid_callback`,
            )
        }

        const supabase = await createClient()

        // Find pending bank connection
        const { data: bank, error: bankError } = await supabase
            .from('banks')
            .select('*')
            .eq('user_id', state)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (bankError || !bank) {
            console.error('Bank record not found:', bankError)
            return NextResponse.redirect(`${request.nextUrl.origin}/dashboard?error=bank_not_found`)
        }

        const client = createEnableBankingClient()

        // Complete authorization and get session
        const sessionResult = await client.authorizeSession({ code }, psu)

        // Update bank record with session info
        const { error: updateError } = await supabase
            .from('banks')
            .update({
                enable_user_id: sessionResult.session_id,
                access_token: sessionResult.session_id, // Store session_id for future API calls
                status: 'active',
            })
            .eq('id', bank.id)

        if (updateError) {
            console.error('Failed to update bank:', updateError)
            return NextResponse.redirect(`${request.nextUrl.origin}/dashboard?error=update_failed`)
        }

        // Automatically sync accounts and transactions after connection
        try {
            await syncBankData({
                supabase,
                client,
                bank: {
                    id: bank.id,
                    access_token: sessionResult.session_id,
                },
                userId: state,
                psu,
            })
        } catch (syncError) {
            console.error('Failed to sync data after connection:', syncError)
            // Continue anyway, user can manually sync later
        }

        // Redirect to dashboard with success
        return NextResponse.redirect(
            `${request.nextUrl.origin}/dashboard?success=bank_connected&bank_id=${bank.id}`,
        )
    } catch (error) {
        console.error('Callback error:', error)
        return NextResponse.redirect(`${request.nextUrl.origin}/dashboard?error=callback_failed`)
    }
}
