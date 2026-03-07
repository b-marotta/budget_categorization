'use client'

import { House, Landmark, ReceiptText, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

const navItems = [
    { href: '/home', label: 'Home', icon: House },
    { href: '/transactions', label: 'Transazioni', icon: ReceiptText },
    { href: '/accounts', label: 'Conti', icon: Landmark },
    { href: '/profile', label: 'Profilo', icon: User },
]

export default function BottomNav() {
    const pathname = usePathname()

    return (
        <footer className="mx-auto flex w-full items-center justify-between border-t pt-3 pb-6 text-center text-xs">
            {navItems.map((item) => {
                const isActive =
                    pathname === item.href ||
                    (item.href !== '/home' && pathname.startsWith(`${item.href}/`))
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
