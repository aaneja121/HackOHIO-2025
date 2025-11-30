import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

import { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Healios - Post-Surgical Recovery Assistant',
  description: 'AI-powered wound analysis and recovery monitoring for post-surgical patients.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning={true}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
