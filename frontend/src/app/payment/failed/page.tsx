'use client'
import { XCircle } from 'lucide-react'
import Link from 'next/link'

export default function PaymentFailedPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="card p-10 text-center max-w-md w-full">
        <XCircle className="mx-auto text-red-500 mb-4" size={72} />
        <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
        <p className="text-gray-500 mb-8">
          Sorry, your payment could not be completed. Please try again.
        </p>
        <div className="flex gap-3">
          <Link href="/cart" className="btn-primary flex-1 text-center py-3">Try Again</Link>
          <Link href="/" className="btn-secondary flex-1 text-center py-3">Go Home</Link>
        </div>
      </div>
    </div>
  )
}
