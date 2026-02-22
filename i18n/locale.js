'use server'

import { cookies } from 'next/headers'

import { getUserData, updateUserData } from '@/lib/actions'

const COOKIE_NAME = 'NEXT_LOCALE'

export async function getLocale() {
    try {
        const { data: user } = await getUserData()
        const locale = user?.account_preferences?.locale || process.env.LOCALE || 'it'
        return locale
    } catch (error) {
        console.error('Error getting locale:', error)
        return process.env.LOCALE || 'it'
    }
}

export async function setLocale({ user, locale }) {
    const cookiesVar = await cookies()
    cookiesVar.set(COOKIE_NAME, locale)

    const response = await updateUserData({
        id: user?.id,
        account_preferences: {
            ...user?.account_preferences,
            locale: locale,
        },
    })

    if (response.status !== 200) {
        console.error('Error updating locale:', response.status, response.statusText)
        return null
    } else {
        return response.data[0]
    }
}
