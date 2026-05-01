'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { orderApi } from '@/lib/api'
import { ChevronLeft } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
}

export default function OrderDetailPage() {
  const params = useParams()
  const id = params?.id as string

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.getOrder(Number(id)).then((r) => r.data),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="card p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="card p-6">
          <p className="font-semibold mb-2">Order not found</p>
          <Link href="/account/orders" className="text-red-600 hover:text-red-700 text-sm">
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  const badgeCls = STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.id}</h1>
          <p className="text-sm text-gray-500">
            {order.created_at
              ? new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : ''}
          </p>
        </div>

        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeCls}`}>
          {order.status_label || order.status}
        </span>
      </div>

      {/* Address */}
      {order.address_detail && (
        <div className="card p-5 mb-6">
          <h2 className="font-semibold mb-3">Shipping Address</h2>
          <div className="text-sm text-gray-700 space-y-1">
            {order.address_detail.full_name && <p>{order.address_detail.full_name}</p>}
            {order.address_detail.phone && <p>{order.address_detail.phone}</p>}
            {order.address_detail.address_line && <p>{order.address_detail.address_line}</p>}
            {(order.address_detail.city || order.address_detail.district) && (
              <p>
                {order.address_detail.city || order.address_detail.district}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="card p-5 mb-6">
        <h2 className="font-semibold mb-3">Items</h2>

        <div className="space-y-3">
          {(order.items || []).map((it: any) => (
            <div
              key={it.id}
              className="flex items-center justify-between border-b last:border-b-0 py-2"
            >
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{it.product_name}</p>
                <p className="text-xs text-gray-500">Qty: {it.quantity}</p>
              </div>

              <div className="text-right">
                <p className="font-semibold text-sm">
                  ৳{Number(it.total_price ?? (it.price * it.quantity)).toLocaleString('en-US')}
                </p>
                <p className="text-xs text-gray-500">
                  ৳{Number(it.price).toLocaleString('en-US')} each
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="card p-5">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span>৳{Number(order.subtotal).toLocaleString('en-US')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Shipping</span>
            <span>৳{Number(order.shipping).toLocaleString('en-US')}</span>
          </div>
          <div className="border-t pt-3 flex justify-between font-bold text-base">
            <span>Total</span>
            <span className="text-red-600">৳{Number(order.total).toLocaleString('en-US')}</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/account/orders"
          className="text-sm text-red-600 hover:text-red-700 font-medium inline-flex items-center gap-2"
        >
          <ChevronLeft size={16} /> Back to Orders
        </Link>
      </div>
    </div>
  )
}