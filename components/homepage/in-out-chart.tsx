import { Label, Pie, PieChart } from 'recharts'

import { cn, formatCurrency } from '@/lib/utils'

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

    const startAngle = 200
    const endAngle = -20

    const innerRadius = '80%'
    const outerRadius = '100%'
    const paddingAngle = 1
    const cornerRadius = '20%'
    const animationActive = true

    return (
        <div className={cn('relative -mb-[18%]', className)}>
            <ChartContainer config={chartConfig} className="mx-auto aspect-square w-full">
                <PieChart>
                    <defs>
                        <pattern
                            id="in-out-stripes"
                            patternUnits="userSpaceOnUse"
                            width="6"
                            height="6"
                            patternTransform="rotate(-45)"
                        >
                            <rect width="20" height="3" fill="rgba(255,255,255,0.15)" />
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
                    >
                        <Label
                            content={({ viewBox }) => {
                                if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) {
                                    return null
                                }

                                return (
                                    <text
                                        x={viewBox.cx}
                                        y={viewBox.cy}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        className="fill-foreground font-medium"
                                        fontSize={'5vw'}
                                    >
                                        {income - outcome > 0 ? '+ ' : '- '}
                                        {formatCurrency(Math.abs(income - outcome))}
                                    </text>
                                )
                            }}
                        />
                    </Pie>
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
                </PieChart>
            </ChartContainer>
        </div>
    )
}
