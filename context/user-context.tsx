'use client'

import { createContext, useContext } from 'react'

import { User } from '@supabase/supabase-js'

type UserContextType = {
    user: User | null
}

const UserContext = createContext<UserContextType>({ user: null })

export function UserProvider({ user, children }: { user: User | null; children: React.ReactNode }) {
    return <UserContext value={{ user }}>{children}</UserContext>
}

export function useUser() {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}
