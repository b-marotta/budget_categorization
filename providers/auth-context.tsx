'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

import type { Session, User } from '@supabase/supabase-js'

import { createClient } from '@/lib/supabase/client'

type AuthContextType = {
    user: User | null
    session: Session | null
    loading: boolean
    refetch: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const supabase = createClient()
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(false)

    const getInitialSession = useCallback(async () => {
        setLoading(true)

        const {
            data: { session },
        } = await supabase.auth.getSession()

        setSession(session)
        setUser(session?.user ?? null)

        setLoading(false)
    }, [supabase])

    const refetch = useCallback(async () => {
        await getInitialSession()
    }, [getInitialSession])

    useEffect(() => {
        getInitialSession()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setLoading(true)

            setSession(session)
            setUser(session?.user ?? null)

            setLoading(false)
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [getInitialSession, supabase])

    return (
        <AuthContext.Provider value={{ user, session, loading, refetch }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}
