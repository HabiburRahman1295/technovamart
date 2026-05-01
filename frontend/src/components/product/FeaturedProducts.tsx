'use client'
import { useQuery } from '@tanstack/react-query'
import { catalogApi } from '@/lib/api'
import ProductCard from './ProductCard'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function FeaturedProducts() {
  const { data, isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => catalogApi.getProducts({ is_featured: true, page_size: 8 }).then(r => r.data),
  })

  const products = data?.results || data || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Featured Products</h2>
        <Link href="/products" className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1 text-sm">
          View All <ChevronRight size={16} />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-xl aspect-square mb-2" />
              <div className="bg-gray-200 h-4 rounded mb-1" />
              <div className="bg-gray-200 h-4 w-2/3 rounded" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-4">📦</div>
          <p>No products found</p>
        </div>
      )}
    </div>
  )
}
