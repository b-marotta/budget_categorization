import { NextRequest, NextResponse } from 'next/server'

import { createEnableBankingClient, extractPSUContext } from '@/lib/enable-banking'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/banks/connect
 * Initiates bank connection flow
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { institution_name, institution_country } = body
        const psu = extractPSUContext(request.headers)

        if (!institution_name || !institution_country) {
            return NextResponse.json(
                { error: 'institution_name and institution_country are required' },
                { status: 400 },
            )
        }

        const client = createEnableBankingClient()
        const redirectUri = `${request.nextUrl.origin}/api/banks/callback`

        // Calculate valid_until (90 days from now as per Enable Banking)
        const validUntil = new Date()
        validUntil.setDate(validUntil.getDate() + 90)

        // Start authorization flow
        const authResult = await client.startAuthorization(
            {
                access: {
                    valid_until: validUntil.toISOString(),
                    balances: true,
                    transactions: true,
                },
                aspsp: {
                    name: institution_name,
                    country: institution_country,
                },
                state: user.id, // use user id as state for verification
                redirect_url: redirectUri,
                psu_type: 'personal',
            },
            psu,
        )

        // Store pending connection in database
        const { data: bank, error: dbError } = await supabase
            .from('banks')
            .insert({
                user_id: user.id,
                institution_id: institution_name, // Use name as ID
                institution_name: institution_name,
                enable_session_id: authResult.authorization_id,
                enable_user_id: '', // will be filled after callback
                status: 'pending',
            })
            .select()
            .single()

        if (dbError) {
            console.error('Failed to create bank record:', dbError)
            return NextResponse.json({ error: 'Failed to create bank connection' }, { status: 500 })
        }

        return NextResponse.json({
            authorization_url: authResult.url,
            bank_id: bank.id,
        })
    } catch (error) {
        console.error('Failed to connect bank:', error)
        return NextResponse.json({ error: 'Failed to initiate bank connection' }, { status: 500 })
    }
}

/**
 * GET /api/banks/connect
 * List user's connected banks
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
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            throw error
        }

        return NextResponse.json({ banks })
    } catch (error) {
        console.error('Failed to fetch banks:', error)
        return NextResponse.json({ error: 'Failed to fetch banks' }, { status: 500 })
    }
}

/**
 * DELETE /api/banks/connect/:id
 * Disconnect a bank
 */
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const bankId = request.nextUrl.searchParams.get('id')
        if (!bankId) {
            return NextResponse.json({ error: 'Bank ID required' }, { status: 400 })
        }

        const { error } = await supabase
            .from('banks')
            .update({ status: 'revoked' })
            .eq('id', bankId)
            .eq('user_id', user.id)

        if (error) {
            throw error
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to disconnect bank:', error)
        return NextResponse.json({ error: 'Failed to disconnect bank' }, { status: 500 })
    }
}
