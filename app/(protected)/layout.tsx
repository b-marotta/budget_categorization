import { Suspense } from 'react'

import BottomNav from '@/components/bottom-nav'
import { UserProvider } from '@/context/user-context'
import { createClient } from '@/lib/supabase/server'

async function ProtectedContent({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()

    return (
        <UserProvider user={data?.user ?? null}>
            <main className="relative flex h-dvh flex-col">
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-auto p-4 pb-25">
                    {children}
                </div>
                <BottomNav />
            </main>
        </UserProvider>
    )
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense>
            <ProtectedContent>{children}</ProtectedContent>
        </Suspense>
    )
}
