'use client'
import { useQuery } from '@tanstack/react-query'
import { catalogApi } from '@/lib/api'
import Image from 'next/image'
import { useState } from 'react'
import { ShoppingCart, Heart, Shield, Truck, RotateCcw } from 'lucide-react'
import { useCartStore } from '@/store'
import toast from 'react-hot-toast'

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const addItem = useCartStore((s) => s.addItem)

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', params.slug],
    queryFn: () => catalogApi.getProduct(params.slug).then((r) => r.data),
  })

  // ✅ Media base URL (from .env.local)
  const MEDIA_BASE =
    process.env.NEXT_PUBLIC_MEDIA_BASE_URL || 'http://localhost:8000'

  // ✅ Convert relative media path -> absolute URL
  const toMediaUrl = (url?: string | null) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    if (url.startsWith('/')) return `${MEDIA_BASE}${url}`
    return `${MEDIA_BASE}/${url}`
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 animate-pulse">
          <div className="bg-gray-200 rounded-xl aspect-square" />
          <div className="space-y-4">
            <div className="bg-gray-200 h-8 rounded w-3/4" />
            <div className="bg-gray-200 h-6 rounded w-1/2" />
            <div className="bg-gray-200 h-10 rounded w-1/3" />
          </div>
        </div>
      </div>
    )
  }

  if (!product)
    return <div className="text-center py-20 text-gray-400">Product not found</div>

  const mainImg = toMediaUrl(product.images?.[activeImg]?.image_url)

  const handleAddToCart = () => {
    addItem({
      product_id: product.id,
      product_name: product.name,
      price: product.effective_price,
      quantity: qty,
      image: mainImg || undefined,
      slug: product.slug,
    })
    toast.success('Added to cart!')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="card overflow-hidden aspect-square relative mb-3">
            {mainImg ? (
              <Image
                src={mainImg}
                alt={product.name}
                fill
                className="object-contain p-6"
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">
                📦
              </div>
            )}

            {product.discount_percent > 0 && (
              <span className="absolute top-4 left-4 badge-discount text-sm px-3 py-1">
                -{product.discount_percent}%
              </span>
            )}
          </div>

          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img: any, idx: number) => {
                const thumbSrc = toMediaUrl(img?.image_url)
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveImg(idx)}
                    className={`shrink-0 w-16 h-16 border-2 rounded-lg overflow-hidden ${
                      activeImg === idx ? 'border-red-500' : 'border-gray-200'
                    }`}
                    type="button"
                  >
                    {thumbSrc ? (
                      <Image
                        src={thumbSrc}
                        alt=""
                        width={64}
                        height={64}
                        className="object-contain w-full h-full p-1"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl text-gray-300">
                        📦
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-sm text-gray-400 mb-1">
            {product.brand?.name} · {product.category?.name}
          </p>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h1>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-red-600">
              ৳{product.effective_price?.toLocaleString()}
            </span>
            {product.discount_price && (
              <span className="text-lg text-gray-400 line-through">
                ৳{product.price?.toLocaleString()}
              </span>
            )}
          </div>

          <div
            className={`inline-flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full mb-4 ${
              product.in_stock ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                product.in_stock ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            {product.in_stock ? `In Stock (${product.stock} available)` : 'Out of Stock'}
          </div>

          {product.in_stock && (
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-4 py-2 hover:bg-gray-100 text-xl font-bold"
                  type="button"
                >
                  -
                </button>
                <span className="px-4 py-2 font-medium w-12 text-center">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="px-4 py-2 hover:bg-gray-100 text-xl font-bold"
                  type="button"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={!product.in_stock}
              className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50"
              type="button"
            >
              <ShoppingCart size={20} /> Add to Cart
            </button>
            <button
              className="p-3 border border-gray-300 rounded-lg hover:border-red-400 hover:text-red-600 transition"
              type="button"
              onClick={() => toast('Wishlist coming soon!')}
            >
              <Heart size={20} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: <Shield size={20} />, text: 'Original Guarantee' },
              { icon: <Truck size={20} />, text: 'Fast Delivery' },
              { icon: <RotateCcw size={20} />, text: '7-Day Return' },
            ].map((b, i) => (
              <div key={i} className="card p-3 text-center text-xs text-gray-600">
                <div className="text-red-600 flex justify-center mb-1">{b.icon}</div>
                {b.text}
              </div>
            ))}
          </div>

          {product.short_description && (
            <p className="text-gray-600 text-sm">{product.short_description}</p>
          )}
        </div>
      </div>

      <div className="mt-12 grid md:grid-cols-2 gap-8">
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Product Description</h2>
          <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
            {product.description}
          </div>
        </div>

        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Specifications</h2>
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(product.specifications).map(([key, value]: any) => (
                  <tr key={key} className="border-b border-gray-50">
                    <td className="py-2 pr-4 text-gray-500 font-medium w-1/3">{key}</td>
                    <td className="py-2 text-gray-800">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}