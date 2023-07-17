'use client'

import './globals.css'
import '@rainbow-me/rainbowkit/styles.css'

import Providers from './providers'
import Header from '@/components/layout/Header'

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-slate-200">
        <Providers>
          <Header />
          <main className='container mx-auto pt-10'>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
export default RootLayout