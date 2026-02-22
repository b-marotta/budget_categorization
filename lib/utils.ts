import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number, currency = 'EUR') => {
    return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency,
    }).format(amount)
}

export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}
