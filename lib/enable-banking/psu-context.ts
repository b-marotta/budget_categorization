import type { PSUContext } from './enable-banking.client'

export function extractPSUContext(headers: Headers): PSUContext {
    const forwardedFor = headers.get('x-forwarded-for')
    const realIp = headers.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0]?.trim() || realIp || undefined
    const userAgent = headers.get('user-agent') || undefined

    return {
        ipAddress,
        userAgent,
    }
}
