import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MPM Trading',
  description: 'MPM trading dashboard for Serik Perizat',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
