import { Suspense } from 'react'

import { UserProvider } from '@/context/user-context'
import { createClient } from '@/lib/supabase/server'

async function ProtectedContent({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()

    return (
        <UserProvider user={data?.user ?? null}>
            <main className="flex h-[100dvh] flex-col">
                <div className="flex flex-1 overflow-hidden">{children}</div>
                <footer className="mx-auto flex w-full items-center justify-center gap-8 border-t py-1 text-center text-xs">
                    <p>Powered by Benedetto Marotta</p>
                </footer>
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
