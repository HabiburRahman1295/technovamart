'use client'
import { useQuery } from '@tanstack/react-query'
import { catalogApi } from '@/lib/api'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function HeroSection() {
  const { data } = useQuery({
    queryKey: ['banners', 'hero'],
    queryFn: () => catalogApi.getBanners('hero').then(r => r.data),
  })

  const banners = data?.results || data || []

  if (!banners.length) {
    // Default hero if no banners
    return (
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-orange-500 text-white py-16 px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              সেরা গ্যাজেট,<br />সেরা দামে!
            </h1>
            <p className="text-lg text-red-100 mb-6">
              বাংলাদেশে সবচেয়ে বড় অনলাইন গ্যাজেট শপ
            </p>
            <Link href="/products" className="inline-flex items-center gap-2 bg-white text-red-600 font-bold px-8 py-3 rounded-lg hover:bg-red-50 transition">
              এখনই কিনুন <ChevronRight size={20} />
            </Link>
          </div>
          <div className="hidden md:block text-9xl">🎮</div>
        </div>
      </div>
    )
  }

  const banner = banners[0]
  return (
    <div className="relative bg-gray-900 overflow-hidden" style={{ minHeight: 340 }}>
      <Image
        src={banner.image_url}
        alt={banner.title}
        fill
        className="object-cover opacity-80"
        priority
      />
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-8 text-white">
          <h1 className="text-4xl font-bold mb-4">{banner.title}</h1>
          {banner.link_url && (
            <Link href={banner.link_url} className="btn-primary inline-flex items-center gap-2">
              Shop Now <ChevronRight size={18} />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
