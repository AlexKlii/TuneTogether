'use client'

import './globals.css'
import '@rainbow-me/rainbowkit/styles.css'

import Providers from './providers'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang='en'>
      <body className='bg-gray-900 text-slate-200'>
        <Providers>
          <div className='flex flex-col min-h-screen'>
            <Header />
            <main className='container mx-auto pt-10 flex-auto'>
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
export default RootLayout