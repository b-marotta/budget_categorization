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

interface Category {
    id: string
    name: string
    color: string
    icon: string
    is_custom: boolean // changed from is_system to is_custom
}

interface CategorySelectProps {
    transactionId: string
    currentCategoryId?: string
    onUpdate?: (categoryId: string) => void
}

export function CategorySelect({
    transactionId,
    currentCategoryId,
    onUpdate,
}: CategorySelectProps) {
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadCategories()
    }, [])

    useEffect(() => {
        if (currentCategoryId && categories.length > 0) {
            const category = categories.find((c) => c.id === currentCategoryId)
            setSelectedCategory(category || null)
        }
    }, [currentCategoryId, categories])

    const loadCategories = async () => {
        try {
            const res = await fetch('/api/categories')
            const data = await res.json()
            setCategories(data.categories || [])
        } catch (error) {
            console.error('Failed to load categories:', error)
        }
    }

    const assignCategory = async (categoryId: string) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/transactions?id=${transactionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category_id: categoryId }),
            })

            if (res.ok) {
                const category = categories.find((c) => c.id === categoryId)
                setSelectedCategory(category || null)
                onUpdate?.(categoryId)
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
                <Button variant="outline" size="sm" disabled={loading}>
                    {selectedCategory ? (
                        <Badge variant="outline" style={{ borderColor: selectedCategory.color }}>
                            {selectedCategory.name}
                        </Badge>
                    ) : (
                        <>
                            <Tag className="mr-2 h-4 w-4" />
                            Categorizza
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                {categories.length === 0 ? (
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
                        {categories.map((category) => (
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
