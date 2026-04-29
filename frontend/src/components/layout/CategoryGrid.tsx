'use client'
import { useQuery } from '@tanstack/react-query'
import { catalogApi } from '@/lib/api'
import Link from 'next/link'
import Image from 'next/image'

const ICONS: Record<string, string> = {
  default: '📦',
  smartphone: '📱', phone: '📱', mobile: '📱',
  laptop: '💻', computer: '🖥️',
  tablet: '📲',
  audio: '🎧', headphone: '🎧', airpods: '🎧',
  watch: '⌚', smartwatch: '⌚',
  gaming: '🎮',
  camera: '📷',
  accessory: '🔌',
}

function getCategoryIcon(name: string): string {
  const lower = name.toLowerCase()
  for (const [key, icon] of Object.entries(ICONS)) {
    if (lower.includes(key)) return icon
  }
  return ICONS.default
}

export default function CategoryGrid() {
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => catalogApi.getCategories().then((r) => r.data),
  })

  const categories = (data?.results || data || []).slice(0, 8)

  // ✅ Media base URL (from .env.local)
  const MEDIA_BASE =
    process.env.NEXT_PUBLIC_MEDIA_BASE_URL || 'http://localhost:8000'

  // ✅ Convert relative media path -> absolute URL
  const getMediaUrl = (url?: string | null) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    if (url.startsWith('/')) return `${MEDIA_BASE}${url}`
    return `${MEDIA_BASE}/${url}`
  }

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Categories</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-200 rounded-xl h-24"
              />
            ))}
        </div>
      </div>
    )
  }

  if (!categories.length) return null

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Categories</h2>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
        {categories.map((cat: any) => {
          const imgSrc = getMediaUrl(cat.image) // যদি backend এ image_url থাকে, এখানে cat.image_url করে দিও

          return (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="card flex flex-col items-center justify-center p-3 hover:border-red-400 hover:shadow-md transition-all text-center group"
            >
              <div className="text-3xl mb-2">
                {imgSrc ? (
                  <div className="relative w-10 h-10">
                    <Image
                      src={imgSrc}
                      alt={cat.name}
                      fill
                      className="object-contain"
                      unoptimized
                      sizes="40px"
                    />
                  </div>
                ) : (
                  getCategoryIcon(cat.name)
                )}
              </div>

              <span className="text-xs font-medium text-gray-700 group-hover:text-red-600 transition leading-tight">
                {cat.name}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}