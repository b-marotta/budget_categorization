'use client'

import { House, Landmark, ReceiptText, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

const navItems = [
    { href: '/', label: 'Home', icon: House },
    { href: '/transactions', label: 'Transazioni', icon: ReceiptText },
    { href: '/accounts', label: 'Conti', icon: Landmark },
    { href: '/profile', label: 'Profilo', icon: User },
]

export default function BottomNav() {
    const pathname = usePathname()

    return (
        <footer className="background-white/10 absolute right-0 bottom-6 left-0 z-50 mx-auto flex w-9/10 items-center justify-between rounded-full border p-2 text-center text-xs shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur">
            {navItems.map((item) => {
                const isActive =
                    pathname === item.href ||
                    (item.href !== '/' && pathname.startsWith(`${item.href}/`))
                const Icon = item.icon

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'flex flex-1 flex-col items-center gap-1',
                            isActive ? 'text-primary' : 'text-muted-foreground',
                        )}
                    >
                        <Icon size={22} />
                        <p className="text-xs">{item.label}</p>
                    </Link>
                )
            })}
        </footer>
    )
}
