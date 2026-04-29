import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Providers from '@/components/Providers'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'TechNova Mart - Best Gadgets & Electronics in Bangladesh',
  description: 'Shop the latest gadgets, smartphones, laptops, and electronics at the best prices in Bangladesh. Fast delivery across Dhaka and all districts.',
  keywords: 'gadgets, electronics, smartphones, laptops, Bangladesh, online shopping',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </Providers>
      </body>
    </html>
  )
}
