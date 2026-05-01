'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { orderApi } from '@/lib/api'
import { useAuthStore } from '@/store'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, ChevronRight } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

export default function MyOrdersPage() {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) router.replace('/auth/login')
  }, [isAuthenticated, router])

  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => orderApi.getMyOrders().then((r) => r.data),
    enabled: isAuthenticated,
  })

  if (!isAuthenticated) return null

  const orders = data?.results || data || []

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {isLoading ? (
        <div className="space-y-4">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="bg-gray-200 h-5 w-1/3 rounded mb-3" />
                <div className="bg-gray-200 h-4 w-1/4 rounded" />
              </div>
            ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="mx-auto text-gray-300 mb-4" size={80} />
          <h3 className="text-xl font-semibold mb-2">No Orders Found</h3>
          <p className="text-gray-500 mb-6">You haven't placed any orders yet</p>
          <Link href="/products" className="btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-lg">Order #{order.id}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[order.status]}`}
                >
                  {STATUS_LABELS[order.status]}
                </span>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {order.items?.length || 0} items
                    {order.items?.slice(0, 2).map((item: any) => (
                      <span key={item.id} className="ml-2 text-gray-700">
                        • {String(item.product_name || '').slice(0, 25)}
                      </span>
                    ))}
                    {order.items?.length > 2 && (
                      <span className="text-gray-500">
                        {' '}
                        +{order.items.length - 2} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-bold text-red-600">
                      ৳{parseFloat(order.total).toLocaleString('en-IN')}
                    </span>
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm"
                    >
                      Details <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
