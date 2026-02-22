// Enable Banking API Client
// Wrapper for Enable Banking API following official documentation
// https://enablebanking.com/docs/api/reference
import { SignJWT } from 'jose'

export interface EnableBankingConfig {
    applicationId: string // kid from app registration
    privateKey: string // RSA private key in PEM format
    baseUrl: string
}

export interface ASPSP {
    name: string
    country: string
    logo?: string
    bic?: string
    psu_types?: string[]
}

export interface StartAuthorizationRequest {
    access: {
        valid_until: string // RFC3339 format
        balances?: boolean
        transactions?: boolean
    }
    aspsp: {
        name: string
        country: string
    }
    state: string
    redirect_url: string
    psu_type?: 'personal' | 'business'
}

export interface StartAuthorizationResponse {
    url: string
    authorization_id: string
}

export interface AuthorizeSessionRequest {
    code: string
}

export interface AccountResource {
    uid: string // UUID for this session
    account_id?: {
        iban?: string
    }
    name?: string
    currency?: string
    identification_hash?: string
}

export interface AuthorizeSessionResponse {
    session_id: string
    accounts: AccountResource[]
    aspsp: ASPSP
}

export interface Balance {
    balance_type: string
    balance_amount: {
        amount: string
        currency: string
    }
}

export interface Transaction {
    transaction_id?: string
    entry_reference?: string
    transaction_amount: {
        amount: string
        currency: string
    }
    credit_debit_indicator: 'CRDT' | 'DBIT'
    status: string
    booking_date?: string
    value_date?: string
    remittance_information?: string[]
    creditor?: { name?: string }
    debtor?: { name?: string }
}

export class EnableBankingClient {
    private config: EnableBankingConfig

    constructor(config: EnableBankingConfig) {
        this.config = config
    }

    /**
     * Generate JWT for API authentication
     * JWT must be signed with RSA private key
     */
    private async generateJWT(): Promise<string> {
        const now = Math.floor(Date.now() / 1000)
        const exp = now + 3600 // 1 hour expiration

        // Import private key
        const privateKey = await crypto.subtle.importKey(
            'pkcs8',
            this.pemToArrayBuffer(this.config.privateKey),
            {
                name: 'RSASSA-PKCS1-v1_5',
                hash: 'SHA-256',
            },
            true,
            ['sign'],
        )

        const jwt = await new SignJWT({
            iss: 'enablebanking.com',
            aud: 'api.enablebanking.com',
            iat: now,
            exp: exp,
        })
            .setProtectedHeader({
                alg: 'RS256',
                typ: 'JWT',
                kid: this.config.applicationId,
            })
            .sign(privateKey)

        return jwt
    }

    private pemToArrayBuffer(pem: string): ArrayBuffer {
        const b64 = pem
            .replace(/-----BEGIN PRIVATE KEY-----/, '')
            .replace(/-----END PRIVATE KEY-----/, '')
            .replace(/\s/g, '')
        const binary = atob(b64)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i)
        }
        return bytes.buffer
    }

    /**
     * List available ASPSPs (banks)
     * GET /aspsps
     */
    async listASPSPs(country?: string): Promise<{ aspsps: ASPSP[] }> {
        const jwt = await this.generateJWT()
        const url = new URL(`${this.config.baseUrl}/aspsps`)
        if (country) {
            url.searchParams.set('country', country)
        }

        const response = await fetch(url.toString(), {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Failed to list ASPSPs: ${response.statusText} - ${error}`)
        }

        return response.json()
    }

    /**
     * Start user authorization flow
     * POST /auth
     */
    async startAuthorization(
        request: StartAuthorizationRequest,
    ): Promise<StartAuthorizationResponse> {
        const jwt = await this.generateJWT()

        const response = await fetch(`${this.config.baseUrl}/auth`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${jwt}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Failed to start authorization: ${response.statusText} - ${error}`)
        }

        return response.json()
    }

    /**
     * Complete authorization and get session with accounts
     * POST /sessions
     */
    async authorizeSession(request: AuthorizeSessionRequest): Promise<AuthorizeSessionResponse> {
        const jwt = await this.generateJWT()

        const response = await fetch(`${this.config.baseUrl}/sessions`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${jwt}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Failed to authorize session: ${response.statusText} - ${error}`)
        }

        return response.json()
    }

    /**
     * Get account balances
     * GET /accounts/{account_id}/balances
     */
    async getAccountBalances(accountId: string): Promise<{ balances: Balance[] }> {
        const jwt = await this.generateJWT()

        const response = await fetch(`${this.config.baseUrl}/accounts/${accountId}/balances`, {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Failed to get balances: ${response.statusText} - ${error}`)
        }

        return response.json()
    }

    /**
     * Get account transactions
     * GET /accounts/{account_id}/transactions
     */
    async getAccountTransactions(
        accountId: string,
        dateFrom?: string,
        dateTo?: string,
    ): Promise<{ transactions: Transaction[]; continuation_key?: string }> {
        const jwt = await this.generateJWT()
        const url = new URL(`${this.config.baseUrl}/accounts/${accountId}/transactions`)

        if (dateFrom) url.searchParams.set('date_from', dateFrom)
        if (dateTo) url.searchParams.set('date_to', dateTo)

        const response = await fetch(url.toString(), {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Failed to get transactions: ${response.statusText} - ${error}`)
        }

        return response.json()
    }

    /**
     * Get session data
     * GET /sessions/{session_id}
     */
    async getSession(sessionId: string): Promise<any> {
        const jwt = await this.generateJWT()

        const response = await fetch(`${this.config.baseUrl}/sessions/${sessionId}`, {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Failed to get session: ${response.statusText} - ${error}`)
        }

        return response.json()
    }

    /**
     * Delete session
     * DELETE /sessions/{session_id}
     */
    async deleteSession(sessionId: string): Promise<void> {
        const jwt = await this.generateJWT()

        const response = await fetch(`${this.config.baseUrl}/sessions/${sessionId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Failed to delete session: ${response.statusText} - ${error}`)
        }
    }
}

// Factory function
export function createEnableBankingClient(): EnableBankingClient {
    const config: EnableBankingConfig = {
        applicationId: process.env.ENABLE_BANKING_APP_ID!,
        privateKey: process.env.ENABLE_BANKING_PRIVATE_KEY!,
        baseUrl: process.env.ENABLE_BANKING_BASE_URL || 'https://api.enablebanking.com',
    }

    if (!config.applicationId || !config.privateKey) {
        throw new Error(
            'Enable Banking credentials not configured. Set ENABLE_BANKING_APP_ID and ENABLE_BANKING_PRIVATE_KEY',
        )
    }

    return new EnableBankingClient(config)
}
