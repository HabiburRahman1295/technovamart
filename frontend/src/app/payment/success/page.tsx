'use client'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCartStore } from '@/store'
import { useEffect } from 'react'

export default function PaymentSuccessPage() {
  const params = useSearchParams()
  const orderId = params.get('order')
  const clearCart = useCartStore(s => s.clearCart)

  useEffect(() => { clearCart() }, [])

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="card p-10 text-center max-w-md w-full">
        <CheckCircle className="mx-auto text-green-500 mb-4" size={72} />
        <h1 className="text-2xl font-bold mb-2">Order Placed Successfully! 🎉</h1>
        <p className="text-gray-500 mb-2">
          Your order {orderId && `#${orderId}`} has been confirmed.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          We will deliver your items soon. Thank you for shopping at TechNova Mart!
        </p>
        <div className="flex gap-3">
          <Link href="/account/orders" className="btn-primary flex-1 text-center py-3">View Orders</Link>
          <Link href="/products" className="btn-secondary flex-1 text-center py-3">Shop More</Link>
        </div>
      </div>
    </div>
  )
}
