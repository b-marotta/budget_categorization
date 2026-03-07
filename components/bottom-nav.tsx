'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { House, Landmark, ReceiptText, User } from 'lucide-react'
import { animate, motion, useDragControls, useMotionValue } from 'motion/react'
import { usePathname, useRouter } from 'next/navigation'

import { cn } from '@/lib/utils'

const NAV_HORIZONTAL_PADDING = 4
const RELEASE_FEEDBACK_DURATION_MS = 150
const HAPTIC_DURATION_MS = 12
const FOOTER_TAP_THRESHOLD_PX = 6
const X_SPRING = { type: 'spring' as const, stiffness: 520, damping: 38, mass: 0.55 }

const navItems = [
    { href: '/', label: 'Home', icon: House },
    { href: '/transactions', label: 'Transazioni', icon: ReceiptText },
    { href: '/accounts', label: 'Conti', icon: Landmark },
    { href: '/profile', label: 'Profilo', icon: User },
]

export default function BottomNav() {
    const pathname = usePathname()
    const router = useRouter()
    const navRef = useRef<HTMLElement | null>(null)
    const pillRef = useRef<HTMLButtonElement | null>(null)
    const isPositionInitializedRef = useRef(false)
    const widthRef = useRef(0)
    const resizeFrameRef = useRef<number | null>(null)
    const isDraggingRef = useRef(false)
    const suppressNextItemClickRef = useRef(false)
    const footerPointerRef = useRef<{
        pointerId: number
        startClientX: number
    } | null>(null)
    const xAnimationRef = useRef<ReturnType<typeof animate> | null>(null)
    const releaseFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const dragControls = useDragControls()
    const x = useMotionValue(0)

    const [containerWidth, setContainerWidth] = useState(0)
    const [isReleaseFeedback, setIsReleaseFeedback] = useState(false)
    const [hasMounted, setHasMounted] = useState(false)
    const [isDragActive, setIsDragActive] = useState(false)

    const effectivePathname = hasMounted ? pathname : '/'

    const activeIndex = useMemo(
        () =>
            Math.max(
                navItems.findIndex(
                    (item) =>
                        effectivePathname === item.href ||
                        (item.href !== '/' && effectivePathname.startsWith(`${item.href}/`)),
                ),
                0,
            ),
        [effectivePathname],
    )

    const innerWidth = Math.max(containerWidth - NAV_HORIZONTAL_PADDING * 2, 0)
    const segmentWidth = innerWidth / navItems.length || 0
    const maxDragX = Math.max(innerWidth - segmentWidth, 0)
    const activeX = Math.min(Math.max(activeIndex * segmentWidth, 0), maxDragX)

    const clampX = (value: number) => Math.min(Math.max(value, 0), maxDragX)

    const getNearestIndexFromPosition = (position: number) => {
        if (segmentWidth <= 0) return activeIndex

        return Math.min(Math.max(Math.round(position / segmentWidth), 0), navItems.length - 1)
    }

    const getSnapXForIndex = (index: number) => clampX(index * segmentWidth)

    const animateToX = (targetX: number) => {
        xAnimationRef.current?.stop()
        xAnimationRef.current = animate(x, targetX, X_SPRING)
    }

    const navigateToIndex = (index: number) => {
        const targetHref = navItems[index]?.href
        if (targetHref && targetHref !== pathname) {
            router.push(targetHref)
        }
    }

    const snapToIndex = (index: number) => {
        const snappedX = getSnapXForIndex(index)
        animateToX(snappedX)
    }

    const getXFromClientX = (clientX: number, navRect: DOMRect) => {
        const relativeX = clientX - navRect.left - NAV_HORIZONTAL_PADDING
        return clampX(relativeX - segmentWidth / 2)
    }

    const triggerReleaseFeedback = (enableHaptic = true) => {
        if (releaseFeedbackTimeoutRef.current) {
            clearTimeout(releaseFeedbackTimeoutRef.current)
        }

        setIsReleaseFeedback(true)
        releaseFeedbackTimeoutRef.current = setTimeout(() => {
            setIsReleaseFeedback(false)
        }, RELEASE_FEEDBACK_DURATION_MS)

        if (enableHaptic && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(HAPTIC_DURATION_MS)
        }
    }

    useEffect(() => {
        setHasMounted(true)
    }, [])

    useEffect(() => {
        const node = navRef.current
        if (!node) return

        const setWidth = () => {
            const nextWidth = Math.round(node.getBoundingClientRect().width)
            if (nextWidth === widthRef.current) return

            widthRef.current = nextWidth
            setContainerWidth(nextWidth)
        }

        const requestMeasure = () => {
            if (resizeFrameRef.current !== null) return

            resizeFrameRef.current = requestAnimationFrame(() => {
                resizeFrameRef.current = null
                setWidth()
            })
        }

        setWidth()

        const resizeObserver = new ResizeObserver(requestMeasure)
        resizeObserver.observe(node)

        return () => {
            resizeObserver.disconnect()
            if (resizeFrameRef.current !== null) {
                cancelAnimationFrame(resizeFrameRef.current)
            }
        }
    }, [])

    useEffect(() => {
        if (!isDraggingRef.current) {
            xAnimationRef.current?.stop()

            if (!isPositionInitializedRef.current) {
                x.jump(activeX)
                isPositionInitializedRef.current = true
                return
            }

            animateToX(activeX)
        }
    }, [activeIndex, activeX, x])

    useEffect(
        () => () => {
            if (releaseFeedbackTimeoutRef.current) {
                clearTimeout(releaseFeedbackTimeoutRef.current)
            }

            xAnimationRef.current?.stop()
        },
        [],
    )

    return (
        <footer
            ref={navRef}
            className="background-white/10 absolute right-0 bottom-6 left-0 z-50 mx-auto flex w-9/10 items-center justify-between overflow-visible rounded-full border p-1 text-center text-xs shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur"
            onPointerDown={(event) => {
                if (isDraggingRef.current || containerWidth <= 0) return

                const target = event.target
                if (pillRef.current && target instanceof Node && pillRef.current.contains(target)) {
                    return
                }

                xAnimationRef.current?.stop()
                suppressNextItemClickRef.current = true
                footerPointerRef.current = {
                    pointerId: event.pointerId,
                    startClientX: event.clientX,
                }

                const navRect = event.currentTarget.getBoundingClientRect()
                const nextX = getXFromClientX(event.clientX, navRect)
                x.set(nextX)
                dragControls.start(event, { snapToCursor: false })
            }}
            onPointerUp={(event) => {
                const footerPointer = footerPointerRef.current
                if (!footerPointer || footerPointer.pointerId !== event.pointerId) return

                footerPointerRef.current = null

                const movedDistance = Math.abs(event.clientX - footerPointer.startClientX)
                if (isDraggingRef.current || movedDistance > FOOTER_TAP_THRESHOLD_PX) {
                    return
                }

                const navRect = event.currentTarget.getBoundingClientRect()
                const nextX = getXFromClientX(event.clientX, navRect)
                const nearestIndex = getNearestIndexFromPosition(nextX)

                triggerReleaseFeedback(false)
                snapToIndex(nearestIndex)
                navigateToIndex(nearestIndex)
            }}
            onPointerCancel={(event) => {
                const footerPointer = footerPointerRef.current
                if (!footerPointer || footerPointer.pointerId !== event.pointerId) return

                footerPointerRef.current = null
            }}
        >
            {containerWidth > 0 ? (
                <motion.button
                    ref={pillRef}
                    type="button"
                    aria-label={`Vai a ${navItems[activeIndex]?.label ?? 'sezione attiva'}`}
                    className={cn(
                        'bg-primary/15 text-primary focus-visible:ring-primary/40 absolute z-20 flex h-12 touch-none items-center justify-center rounded-full border will-change-transform outline-none focus-visible:ring-2 focus-visible:ring-offset-0',
                        'cursor-grab',
                        isDragActive
                            ? 'border-primary opacity-35'
                            : 'border-primary/30 opacity-100',
                        isReleaseFeedback && 'ring-primary/35 ring-2',
                    )}
                    style={{
                        left: NAV_HORIZONTAL_PADDING,
                        width: segmentWidth,
                        x,
                    }}
                    whileDrag={{
                        scale: 1.1,
                        cursor: 'grabbing',
                    }}
                    drag="x"
                    dragControls={dragControls}
                    dragListener={false}
                    dragConstraints={{ left: 0, right: maxDragX }}
                    dragElastic={0}
                    dragMomentum={false}
                    animate={{
                        scale: isReleaseFeedback ? 1.05 : 1,
                        y: isReleaseFeedback ? -1 : 0,
                    }}
                    transition={{
                        x: { duration: 0 },
                        scale: X_SPRING,
                        y: X_SPRING,
                    }}
                    onPointerDown={(event) => {
                        xAnimationRef.current?.stop()
                        dragControls.start(event, { snapToCursor: false })
                    }}
                    onDragStart={() => {
                        isDraggingRef.current = true
                        setIsDragActive(true)
                    }}
                    onDragEnd={() => {
                        const finalX = clampX(x.get())
                        const nearestIndex = getNearestIndexFromPosition(finalX)

                        isDraggingRef.current = false
                        setIsDragActive(false)
                        suppressNextItemClickRef.current = true
                        triggerReleaseFeedback()

                        snapToIndex(nearestIndex)
                        navigateToIndex(nearestIndex)
                    }}
                />
            ) : null}

            {navItems.map((item, itemIndex) => {
                const isActive =
                    effectivePathname === item.href ||
                    (item.href !== '/' && effectivePathname.startsWith(`${item.href}/`))
                const Icon = item.icon

                return (
                    <button
                        key={item.href}
                        type="button"
                        aria-current={isActive ? 'page' : undefined}
                        onClick={() => {
                            if (suppressNextItemClickRef.current) {
                                suppressNextItemClickRef.current = false
                                return
                            }

                            if (itemIndex < 0) return

                            snapToIndex(itemIndex)
                            navigateToIndex(itemIndex)
                        }}
                        className={cn(
                            'relative z-10 flex flex-1 flex-col items-center gap-1 rounded-full p-1',
                            isActive ? 'text-primary' : 'text-black',
                        )}
                    >
                        <Icon size={20} />
                        <p className="text-xs">{item.label}</p>
                    </button>
                )
            })}
        </footer>
    )
}
