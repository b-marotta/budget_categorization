export interface Account {
    id: string
    name: string
    iban: string
    currency: string
    current_balance: number
    bank: {
        id: string
        institution_name: string
        status: string
    }
}

export interface Transaction {
    id: string
    description: string
    amount: number
    currency: string
    transaction_date: string
    is_pending?: boolean
    account: {
        name: string
        bank: {
            institution_name: string
        }
    }
    category?: {
        id: string
        name: string
        color: string
        icon: string
    }
}

export interface Category {
    id: string
    type: 'income' | 'expense'
    main_category?: string
    name: string
    color: string
    icon: string
    is_custom: boolean
}

export interface Stats {
    totalBalance: number
    income: number
    expenses: number
}

export interface Institution {
    name: string
    country: string
    logo?: string
    bic?: string
    psu_types?: string[]
}
