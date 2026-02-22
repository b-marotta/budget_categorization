import { Suspense } from 'react'

import { House, ReceiptText, User } from 'lucide-react'
import Link from 'next/link'

import { UserProvider } from '@/context/user-context'
import { createClient } from '@/lib/supabase/server'

async function ProtectedContent({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()

    return (
        <UserProvider user={data?.user ?? null}>
            <main className="flex h-dvh flex-col">
                <div className="min-h-0 flex-1 overflow-y-auto">
                    <div className="min-h-full p-4">{children}</div>
                </div>
                <footer className="mx-auto flex w-full items-center justify-between border-t px-6 py-3 text-center text-xs">
                    <Link href={'/home'} className="flex flex-1 flex-col items-center gap-1">
                        <House size={22} />
                        <p className="text-muted-foreground text-xs">Home</p>
                    </Link>
                    <Link
                        href={'/transactions'}
                        className="flex flex-1 flex-col items-center gap-1"
                    >
                        <ReceiptText size={22} />
                        <p className="text-muted-foreground text-xs">Transazioni</p>
                    </Link>
                    <Link href={'/link'} className="flex flex-1 flex-col items-center gap-1">
                        <User size={22} />
                        <p className="text-muted-foreground text-xs">Banche</p>
                    </Link>
                    <Link href={'/account'} className="flex flex-1 flex-col items-center gap-1">
                        <User size={22} />
                        <p className="text-muted-foreground text-xs">Account</p>
                    </Link>
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
