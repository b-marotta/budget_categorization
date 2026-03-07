'use client'

import { useState } from 'react'

import { RefreshCw } from 'lucide-react'

const DEFAULT_PULL_TRIGGER_DISTANCE = 72
const DEFAULT_MAX_PULL_DISTANCE = 120
const DEFAULT_PULL_FRICTION = 0.6

interface PullToRefreshProps {
    children: React.ReactNode
    friction?: number
    triggerDistance?: number
    maxPullDistance?: number
}
export default function PullToRefresh({
    children,
    friction = DEFAULT_PULL_FRICTION,
    triggerDistance = DEFAULT_PULL_TRIGGER_DISTANCE,
    maxPullDistance = DEFAULT_MAX_PULL_DISTANCE,
}: PullToRefreshProps) {
    const safeFriction = Math.min(Math.max(friction, 0.2), 1)
    const safeTriggerDistance = Math.max(triggerDistance, 24)
    const safeMaxPullDistance = Math.max(maxPullDistance, safeTriggerDistance)
    const [touchStartY, setTouchStartY] = useState<number | null>(null)
    const [pullDistance, setPullDistance] = useState(0)
    const [isPulling, setIsPulling] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const handleTouchStart: React.TouchEventHandler<HTMLDivElement> = (event) => {
        if (isRefreshing) {
            return
        }

        const currentTarget = event.currentTarget

        if (currentTarget.scrollTop > 0) {
            setTouchStartY(null)
            return
        }

        setTouchStartY(event.touches[0].clientY)
        setIsPulling(true)
    }

    const handleTouchMove: React.TouchEventHandler<HTMLDivElement> = (event) => {
        if (!isPulling || touchStartY === null || isRefreshing) {
            return
        }

        const delta = event.touches[0].clientY - touchStartY

        if (delta <= 0) {
            setPullDistance(0)
            return
        }

        event.preventDefault()
        const easedDistance = Math.min(delta * safeFriction, safeMaxPullDistance)
        setPullDistance(easedDistance)
    }

    const resetPullState = () => {
        setPullDistance(0)
        setTouchStartY(null)
        setIsPulling(false)
    }

    const handleTouchEnd: React.TouchEventHandler<HTMLDivElement> = () => {
        if (!isPulling || isRefreshing) {
            return
        }

        if (pullDistance >= safeTriggerDistance) {
            setIsRefreshing(true)
            window.location.reload()
            return
        }

        resetPullState()
    }

    const isReadyToRefresh = pullDistance >= safeTriggerDistance

    return (
        <div
            className="bg-muted/40 relative min-h-0 flex-1 overflow-y-auto"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={resetPullState}
        >
            <div
                className="pointer-events-none absolute inset-x-0 top-0 z-0 flex h-12 items-center justify-center"
                style={{ opacity: pullDistance > 2 || isRefreshing ? 1 : 0 }}
            >
                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                    <RefreshCw
                        className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                        style={{ transform: `rotate(${Math.min(pullDistance * 2, 180)}deg)` }}
                    />
                    <span>
                        {isRefreshing
                            ? 'Aggiornamento...'
                            : isReadyToRefresh
                              ? 'Rilascia per aggiornare'
                              : 'Trascina per aggiornare'}
                    </span>
                </div>
            </div>

            <div
                className="bg-background relative z-10 min-h-full"
                style={{
                    transform: `translateY(${pullDistance}px)`,
                    transition: isPulling ? 'none' : 'transform 180ms ease',
                }}
            >
                {children}
            </div>
        </div>
    )
}
