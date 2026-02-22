import { NextRequest, NextResponse } from 'next/server'

import { createEnableBankingClient } from '@/lib/enable-banking'
import { createClient } from '@/lib/supabase/server'

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
        const country = searchParams.get('country')

        const client = createEnableBankingClient()
        const result = await client.listASPSPs(country || undefined)

        return NextResponse.json({ institutions: result.aspsps })
    } catch (error) {
        console.error('Failed to list institutions:', error)
        return NextResponse.json({ error: 'Failed to list institutions' }, { status: 500 })
    }
}
