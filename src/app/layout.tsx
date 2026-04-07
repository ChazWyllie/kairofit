/**
 * Root Layout
 *
 * Required by Next.js App Router - every app needs exactly one root layout.
 * Provides the HTML shell: <html>, <body>, global fonts, and dark background.
 *
 * Route group layouts (auth), (app), and onboarding/ layer on top of this.
 * This file does NOT include the app shell nav - that lives in (app)/layout.tsx.
 */

import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { PostHogProvider } from '@/components/providers/PostHogProvider'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'KairoFit',
  description: 'Research-backed AI workout programming. Now you know why.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[#0A0A0B] text-[#F5F5F4] antialiased`}
      >
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  )
}
