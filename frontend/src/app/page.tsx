import { Suspense } from 'react'
import HeroSection from '@/components/layout/HeroSection'
import FeaturedProducts from '@/components/product/FeaturedProducts'
import CategoryGrid from '@/components/layout/CategoryGrid'

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        <CategoryGrid />
        <FeaturedProducts />
      </div>
    </div>
  )
}
