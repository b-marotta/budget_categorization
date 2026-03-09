import { PlusCircle } from 'lucide-react'
import Link from 'next/link'

import { cn, formatCurrency } from '@/lib/utils'
import { Account } from '@/types'

export default function AccountsList({
    accounts,
    totalBalance,
}: {
    accounts: Account[]
    totalBalance: number
}) {
    const ACCOUNTS_COLOR_VARS = [
        '--chart-1',
        '--chart-2',
        '--chart-3',
        '--chart-4',
        '--chart-5',
        '--chart-6',
    ]

    function getAccountColor(index: number) {
        const chartVar = ACCOUNTS_COLOR_VARS[index % ACCOUNTS_COLOR_VARS.length]
        return `var(${chartVar})`
    }
    return (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4">
            {accounts.map((account, index) => {
                const percentage = totalBalance > 0 ? account.current_balance / totalBalance : 0
                const accountColor = getAccountColor(index)

                return (
                    <div
                        key={account.id}
                        className="w-40 min-w-40 items-center space-y-3 rounded-xl border bg-white p-3 text-center"
                    >
                        <div
                            className="mx-auto h-1 w-2/5 rounded-full"
                            style={{ backgroundColor: accountColor }}
                        />
                        <div className="min-w-0 flex-1 text-xs">
                            <div className="truncate font-medium">{account.name}</div>
                            <div className="text-muted-foreground truncate">
                                {account.bank.institution_name}
                            </div>
                        </div>
                        <div className="text-lg font-semibold">
                            {formatCurrency(account.current_balance, account.currency)}
                        </div>
                        {/* this represent the percentage of this account on the total amount */}
                        <div className="flex h-3 w-full items-center gap-0.5 rounded-full">
                            <div
                                className={cn(
                                    'h-full rounded-l-3xl',
                                    percentage < 0.95 ? 'rounded-r' : 'rounded-r-3xl',
                                )}
                                style={{
                                    width: `${percentage * 100}%`,
                                    backgroundColor: accountColor,
                                    backgroundImage:
                                        'repeating-linear-gradient(-45deg, rgba(255,255,255,0.22), rgba(255,255,255,0.22) 3px, rgba(255,255,255,0) 3px, rgba(255,255,255,0) 6px)',
                                }}
                            />
                            {percentage < 0.95 && (
                                <div
                                    className="h-[125%] w-0.5 rounded-full"
                                    style={{ backgroundColor: accountColor }}
                                />
                            )}
                            <div
                                className="h-full flex-1 rounded-l rounded-r-3xl"
                                style={{
                                    backgroundImage:
                                        'repeating-linear-gradient(-45deg, #e6e6e6, #e6e6e6 6px, #f3f3f3 6px, #f3f3f3 12px)',
                                }}
                            />
                        </div>
                    </div>
                )
            })}
            <Link
                href="/accounts"
                className="border-muted-foreground text-muted-foreground min-h-34 w-40 cursor-pointer content-center space-y-3 rounded-xl border border-dashed p-3 text-center opacity-50"
            >
                <div className="min-w-0 flex-1 text-xs">
                    <div className="truncate font-medium">Collega un nuovo conto</div>
                </div>
                <div className="text-lg font-semibold">
                    <PlusCircle strokeWidth={'1'} className="mx-auto h-8 w-8" />
                </div>
            </Link>
        </div>
    )
}
