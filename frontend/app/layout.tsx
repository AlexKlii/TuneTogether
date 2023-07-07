'use client'

import './globals.css'
import '@rainbow-me/rainbowkit/styles.css'

import { Providers } from './providers'

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-slate-200">
        <Providers>
          <main className='container mx-auto pt-10'>
            <h1 className='text-center text-6xl hover:scale-110 hover:pl-2'>
              Tune Together
            </h1>

            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}

export default RootLayout
