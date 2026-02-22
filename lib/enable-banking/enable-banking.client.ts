import { SignJWT } from 'jose'

import type {
    AccountResource,
    AuthorizeSessionRequest,
    AuthorizeSessionResponse,
    CreatePaymentRequest,
    CreatePaymentResponse,
    ErrorResponse,
    GetApplicationResponse,
    GetAspspsResponse,
    GetPaymentResponse,
    GetPaymentTransactionResponse,
    GetSessionResponse,
    HalBalances,
    HalTransactions,
    StartAuthorizationRequest,
    StartAuthorizationResponse,
    SuccessResponse,
    Transaction,
} from './enable-banking.types'

export interface EnableBankingConfig {
    applicationId: string
    privateKey: string
    baseUrl: string
}

export interface PSUContext {
    ipAddress?: string
    userAgent?: string
}

export class EnableBankingClient {
    constructor(private config: EnableBankingConfig) {}

    private async generateJWT(): Promise<string> {
        const now = Math.floor(Date.now() / 1000)
        const exp = now + 3600

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

        return new SignJWT({
            iss: 'enablebanking.com',
            aud: 'api.enablebanking.com',
            iat: now,
            exp,
        })
            .setProtectedHeader({
                alg: 'RS256',
                typ: 'JWT',
                kid: this.config.applicationId,
            })
            .sign(privateKey)
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

    private getPSUHeaders(psu?: PSUContext): Record<string, string> {
        const headers: Record<string, string> = {}

        if (psu?.ipAddress) {
            headers['psu-ip-address'] = psu.ipAddress
        }

        if (psu?.userAgent) {
            headers['psu-user-agent'] = psu.userAgent
        }

        return headers
    }

    private async request<T>(
        path: string,
        options: RequestInit = {},
        psu?: PSUContext,
    ): Promise<T> {
        const jwt = await this.generateJWT()
        const res = await fetch(`${this.config.baseUrl}${path}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${jwt}`,
                ...this.getPSUHeaders(psu),
                ...(options.headers || {}),
            },
        })

        if (!res.ok) {
            let error: ErrorResponse | string
            try {
                error = (await res.json()) as ErrorResponse
            } catch {
                error = await res.text()
            }
            throw new Error(`Enable Banking API error (${res.status}): ${JSON.stringify(error)}`)
        }

        return res.json()
    }

    /* =====================
    META
===================== */

    getAspsps(params?: {
        country?: string
        psu_type?: string
        service?: string
        payment_type?: string
    }) {
        const normalizedParams = Object.entries(params || {}).reduce(
            (acc, [key, value]) => {
                if (typeof value === 'string' && value.length > 0) {
                    acc[key] = value
                }
                return acc
            },
            {} as Record<string, string>,
        )
        const query =
            Object.keys(normalizedParams).length > 0
                ? `?${new URLSearchParams(normalizedParams)}`
                : ''

        return this.request<GetAspspsResponse>(`/aspsps${query}`, {
            method: 'GET',
        })
    }

    listASPSPs(country?: string) {
        return this.getAspsps({ country })
    }

    getApplication() {
        return this.request<GetApplicationResponse>(`/application`, {
            method: 'GET',
        })
    }

    /* =====================
     AUTH / SESSIONS
  ===================== */

    startAuthorization(body: StartAuthorizationRequest, psu?: PSUContext) {
        return this.request<StartAuthorizationResponse>(
            `/auth`,
            {
                method: 'POST',
                body: JSON.stringify(body),
            },
            psu,
        )
    }

    authorizeSession(request: AuthorizeSessionRequest, psu?: PSUContext) {
        return this.request<AuthorizeSessionResponse>(
            `/sessions`,
            {
                method: 'POST',
                body: JSON.stringify(request),
            },
            psu,
        )
    }

    getSession(sessionId: string) {
        return this.request<GetSessionResponse>(`/sessions/${sessionId}`, {
            method: 'GET',
        })
    }

    deleteSession(sessionId: string, psu?: PSUContext) {
        return this.request<SuccessResponse>(
            `/sessions/${sessionId}`,
            {
                method: 'DELETE',
            },
            psu,
        )
    }

    /* =====================
     ACCOUNTS
  ===================== */

    getAccountDetails(accountId: string, psu?: PSUContext) {
        return this.request<AccountResource>(
            `/accounts/${accountId}/details`,
            {
                method: 'GET',
            },
            psu,
        )
    }

    getAccountBalances(accountId: string, psu?: PSUContext) {
        return this.request<HalBalances>(
            `/accounts/${accountId}/balances`,
            {
                method: 'GET',
            },
            psu,
        )
    }

    getAccountTransactions(
        accountId: string,
        dateFrom?: string,
        dateTo?: string,
        psu?: PSUContext,
        continuationKey?: string,
    ) {
        const params: Record<string, string> = {}
        if (dateFrom) params.date_from = dateFrom
        if (dateTo) params.date_to = dateTo
        if (continuationKey) params.continuation_key = continuationKey
        const query = Object.keys(params).length > 0 ? `?${new URLSearchParams(params)}` : ''

        return this.request<HalTransactions>(
            `/accounts/${accountId}/transactions${query}`,
            {
                method: 'GET',
            },
            psu,
        )
    }

    getTransactionDetails(accountId: string, transactionId: string, psu?: PSUContext) {
        return this.request<Transaction>(
            `/accounts/${accountId}/transactions/${transactionId}`,
            {
                method: 'GET',
            },
            psu,
        )
    }

    /* =====================
     PAYMENTS
  ===================== */

    createPayment(body: CreatePaymentRequest) {
        return this.request<CreatePaymentResponse>(`/payments`, {
            method: 'POST',
            body: JSON.stringify(body),
        })
    }

    getPayment(paymentId: string) {
        return this.request<GetPaymentResponse>(`/payments/${paymentId}`, { method: 'GET' })
    }

    deletePayment(paymentId: string) {
        return this.request<SuccessResponse>(`/payments/${paymentId}`, { method: 'DELETE' })
    }

    getPaymentTransaction(paymentId: string, transactionId: string) {
        return this.request<GetPaymentTransactionResponse>(
            `/payments/${paymentId}/transactions/${transactionId}`,
            { method: 'GET' },
        )
    }
}

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
