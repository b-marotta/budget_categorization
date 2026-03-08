import { Separator } from '../ui/separator'
import InOutChart from './in-out-chart'

export default function InOutCardContent({
    monthlyIncome,
    monthlyExpenses,
}: {
    monthlyIncome: number
    monthlyExpenses: number
}) {
    return (
        <div className="flex items-center gap-4 py-4">
            <InOutChart
                income={monthlyIncome}
                outcome={monthlyExpenses}
                className="-mb-18 flex h-30 w-3/5"
            />
            <Separator orientation="vertical" />
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <div
                        className="w-1 self-stretch rounded-full"
                        style={{ backgroundColor: 'var(--chart-1)' }}
                    />
                    <div className="flex flex-col">
                        <p>Entrate</p>
                        <p>{String(monthlyIncome.toFixed(2)).replace('.', ',')} €</p>
                    </div>
                </div>
                <Separator className="my-4" />
                <div className="flex items-center gap-2">
                    <div
                        className="w-1 self-stretch rounded-full"
                        style={{ backgroundColor: 'var(--chart-2)' }}
                    />
                    <div className="flex flex-col">
                        <p>Uscite</p>
                        <p>{String(monthlyExpenses.toFixed(2)).replace('.', ',')} €</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
