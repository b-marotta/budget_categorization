import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/categories
 * Get all available categories (system + user custom)
 */
export async function GET() {
    try {
        const supabase = await createClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get system categories (available to all users)
        const { data: systemCategories, error: systemError } = await supabase
            .from('system_categories')
            .select('*')
            .order('name')

        if (systemError) {
            throw systemError
        }

        // Get user's custom categories
        const { data: userCategories, error: userError } = await supabase
            .from('user_categories')
            .select('*')
            .eq('user_id', user.id)
            .order('name')

        if (userError) {
            throw userError
        }

        // Combine and mark the source
        const categories = [
            ...(systemCategories || []).map((cat) => ({ ...cat, is_custom: false })),
            ...(userCategories || []).map((cat) => ({ ...cat, is_custom: true })),
        ]

        return NextResponse.json({ categories })
    } catch (error) {
        console.error('Failed to fetch categories:', error)
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
    }
}

/**
 * POST /api/categories
 * Create a new custom category (user-specific)
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { type, name, color, icon } = body

        if (!type || !name) {
            return NextResponse.json({ error: 'Type and name are required' }, { status: 400 })
        }

        const { data: category, error } = await supabase
            .from('user_categories')
            .insert({
                user_id: user.id,
                type,
                name,
                color: color || '#94a3b8',
                icon: icon || 'Tag',
            })
            .select()
            .single()

        if (error) {
            if (error.code === '23505') {
                // Unique constraint violation
                return NextResponse.json({ error: 'Category name already exists' }, { status: 409 })
            }
            throw error
        }

        return NextResponse.json({ category: { ...category, is_custom: true } }, { status: 201 })
    } catch (error) {
        console.error('Failed to create category:', error)
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
    }
}

/**
 * PATCH /api/categories/:id
 * Update a custom category (only user categories can be updated)
 */
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const categoryId = request.nextUrl.searchParams.get('id')
        if (!categoryId) {
            return NextResponse.json({ error: 'Category ID required' }, { status: 400 })
        }

        const body = await request.json()
        const { type, name, color, icon } = body

        const updates: Record<string, string> = {}
        if (type) updates.type = type
        if (name) updates.name = name
        if (color) updates.color = color
        if (icon) updates.icon = icon

        const { data: category, error } = await supabase
            .from('user_categories')
            .update(updates)
            .eq('id', categoryId)
            .eq('user_id', user.id)
            .select()
            .single()

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'Category name already exists' }, { status: 409 })
            }
            throw error
        }

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found or cannot be modified' },
                { status: 404 },
            )
        }

        return NextResponse.json({ category: { ...category, is_custom: true } })
    } catch (error) {
        console.error('Failed to update category:', error)
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
    }
}

/**
 * DELETE /api/categories/:id
 * Delete a custom category (only user categories can be deleted)
 */
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const categoryId = request.nextUrl.searchParams.get('id')
        if (!categoryId) {
            return NextResponse.json({ error: 'Category ID required' }, { status: 400 })
        }

        const { error } = await supabase
            .from('user_categories')
            .delete()
            .eq('id', categoryId)
            .eq('user_id', user.id)

        if (error) {
            throw error
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to delete category:', error)
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
    }
}
