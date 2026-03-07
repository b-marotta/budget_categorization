'use client'

import { useEffect, useState } from 'react'

import { Tag } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { refetchFinanceData } from '@/hooks/data-refresh-events'
import { Category } from '@/types'

interface CategorySelectProps {
    transactionId: string
    currentCategoryId?: string
    transactionAmount: number
    categories: Category[]
    onUpdate?: () => void
}

export function CategorySelect({
    transactionId,
    currentCategoryId,
    transactionAmount,
    categories,
    onUpdate,
}: CategorySelectProps) {
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>(currentCategoryId || '')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setSelectedCategoryId(currentCategoryId || '')
    }, [currentCategoryId])

    const selectedCategory = categories.find((c) => c.id === selectedCategoryId) || null
    const transactionType = transactionAmount > 0 ? 'income' : 'expense'
    const filteredCategories = categories.filter((category) => category.type === transactionType)

    const assignCategory = async (categoryId: string) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/transactions?id=${transactionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category_id: categoryId }),
            })

            if (res.ok) {
                setSelectedCategoryId(categoryId)
                refetchFinanceData({ transactions: true })
                onUpdate?.()
            }
        } catch (error) {
            console.error('Failed to assign category:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {selectedCategory ? (
                    <Badge variant="outline" style={{ borderColor: selectedCategory.color }}>
                        {selectedCategory.name}
                    </Badge>
                ) : (
                    <Button variant="outline" size="sm" disabled={loading}>
                        <Tag className="mr-2 h-4 w-4" />
                        Categorizza
                    </Button>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                {filteredCategories.length === 0 ? (
                    <div className="text-muted-foreground p-2 text-sm">
                        Nessuna categoria disponibile
                    </div>
                ) : (
                    <>
                        {selectedCategory && (
                            <>
                                <DropdownMenuItem onClick={() => assignCategory('')}>
                                    <span className="text-muted-foreground">Rimuovi categoria</span>
                                </DropdownMenuItem>
                                <div className="bg-border my-1 h-px" />
                            </>
                        )}
                        {filteredCategories.map((category) => (
                            <DropdownMenuItem
                                key={category.id}
                                onClick={() => assignCategory(category.id)}
                            >
                                <div className="flex items-center gap-2">
                                    <div
                                        className="h-3 w-3 rounded-full"
                                        style={{ backgroundColor: category.color }}
                                    />
                                    <span>{category.name}</span>
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
