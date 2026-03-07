import type { Metadata, Viewport } from 'next'
// import { ThemeProvider } from 'next-themes'
import { Geist } from 'next/font/google'

import ServiceWorkerRegister from '@/components/pwa/service-worker-register'

import './globals.css'

const defaultUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'

export const metadata: Metadata = {
    metadataBase: new URL(defaultUrl),
    title: 'Budget Categorization App',
    description: 'Best App ever!',
    applicationName: 'Budget Categorization',
    manifest: '/manifest.webmanifest',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Budget Categorization',
    },
    icons: {
        icon: [
            {
                url: '/icons/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                url: '/icons/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
        apple: [
            {
                url: '/icons/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
        ],
    },
}

export const viewport: Viewport = {
    themeColor: '#0f172a',
}

const geistSans = Geist({
    variable: '--font-geist-sans',
    display: 'swap',
    subsets: ['latin'],
})

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning className="overflow-hidden">
            <body
                className={`${geistSans.className} overflow-auto antialiased`}
                suppressHydrationWarning
            >
                <ServiceWorkerRegister />
                {/* <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                > */}
                {children}
                {/* </ThemeProvider> */}
            </body>
        </html>
    )
}
