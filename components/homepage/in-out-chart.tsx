import { Pie, PieChart } from 'recharts'

import { cn } from '@/lib/utils'

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart'

export default function InOutChart({
    className,
    income,
    outcome,
}: {
    className?: string
    income: number
    outcome: number
}) {
    const chartData = [
        { type: 'income', amount: income, fill: 'var(--chart-1)' },
        { type: 'outcome', amount: outcome, fill: 'var(--chart-2)' },
    ]

    if (income === 0 && outcome === 0) {
        chartData[0].amount = 1
        chartData[1].amount = 1
    }

    const chartConfig = {
        income: {
            label: 'Entrate',
        },
        outcome: {
            label: 'Uscite',
        },
    } satisfies ChartConfig

    const startAngle = 190
    const endAngle = -10

    const innerRadius = '85%'
    const outerRadius = '100%'
    const paddingAngle = 1
    const cornerRadius = '20%'
    const animationActive = true

    return (
        <div className={cn('relative', className)}>
            <div className="absolute inset-0 bottom-12 flex items-end justify-center">
                <div className="text-center">
                    <div className="-mr-1 text-xl">
                        {String((income + outcome).toFixed(2)).replace('.', ',')} €
                    </div>
                </div>
            </div>
            <ChartContainer config={chartConfig} className="mx-auto h-80 w-full max-w-80">
                <PieChart>
                    <defs>
                        <pattern
                            id="in-out-stripes"
                            patternUnits="userSpaceOnUse"
                            width="8"
                            height="8"
                            patternTransform="rotate(-45)"
                        >
                            <rect width="12" height="4" fill="rgba(255,255,255,0.15)" />
                            <rect y="4" width="12" height="4" fill="rgba(255,255,255,0)" />
                        </pattern>
                    </defs>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie
                        startAngle={startAngle}
                        endAngle={endAngle}
                        data={chartData}
                        dataKey="amount"
                        innerRadius={innerRadius}
                        outerRadius={outerRadius}
                        paddingAngle={paddingAngle}
                        cornerRadius={cornerRadius}
                        isAnimationActive={animationActive}
                    />
                    <Pie
                        startAngle={startAngle}
                        endAngle={endAngle}
                        data={chartData.map((item) => ({
                            ...item,
                            fill: 'url(#in-out-stripes)',
                        }))}
                        dataKey="amount"
                        innerRadius={innerRadius}
                        outerRadius={outerRadius}
                        paddingAngle={paddingAngle}
                        cornerRadius={cornerRadius}
                        isAnimationActive={animationActive}
                    />
                    {/* <Label position="center" fill="black" className="text-sm">
                        {String((income + outcome).toFixed(2)).replace('.', ',')} €
                    </Label> */}
                </PieChart>
            </ChartContainer>
        </div>
    )
}
