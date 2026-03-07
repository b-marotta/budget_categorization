import { Suspense } from 'react'

import BottomNav from '@/components/bottom-nav'
import PullToRefresh from '@/components/pull-to-refresh'
import { UserProvider } from '@/context/user-context'
import { createClient } from '@/lib/supabase/server'

async function ProtectedContent({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()

    return (
        <UserProvider user={data?.user ?? null}>
            <main className="flex h-dvh flex-col overflow-hidden overscroll-none">
                <PullToRefresh friction={0.45} triggerDistance={84} maxPullDistance={136}>
                    <div className="min-h-full p-4 pb-24">{children}</div>
                </PullToRefresh>
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
