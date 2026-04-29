'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  ChevronRight,
  Phone,
} from 'lucide-react'
import { useCartStore } from '@/store'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const totalItems = useCartStore((s) => s.totalItems)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setMenuOpen(false)
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/products')
    }
  }

  const NAV_CATEGORIES = [
    { name: 'Smartphone', slug: 'smartphone' },
    { name: 'Laptop', slug: 'laptop' },
    { name: 'Tablet', slug: 'tablet' },
    { name: 'Earbuds', slug: 'earbuds' },
    { name: 'Smartwatch', slug: 'smartwatch' },
    { name: 'Gaming', slug: 'gaming' },
    { name: 'Accessories', slug: 'accessories' },
  ]

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-red-600 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="flex items-center gap-1">
            <Phone size={12} /> Hotline: 01780-732067
          </span>
          <span>🚀 Same-day delivery in Dhaka!</span>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="bg-red-600 text-white font-bold text-lg px-3 py-1 rounded-lg">
            TN
          </div>
          <div className="hidden sm:block">
            <div className="font-bold text-gray-900 leading-tight">TechNova</div>
            <div className="text-xs text-gray-500 leading-tight">Mart</div>
          </div>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 flex">
          <div className="flex w-full max-w-2xl border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-red-500 focus-within:border-transparent">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 px-4 py-2.5 text-sm outline-none"
            />
            <button
              type="submit"
              className="bg-red-600 text-white px-4 hover:bg-red-700 transition"
            >
              <Search size={18} />
            </button>
          </div>
        </form>

        {/* Cart */}
        <Link
          href="/cart"
          className="flex flex-col items-center text-gray-600 hover:text-red-600 transition relative"
        >
          <ShoppingCart size={22} />
          <span className="text-xs mt-0.5">Cart</span>
          {totalItems() > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {totalItems()}
            </span>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="bg-gray-900 text-white relative">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-6">
          <button
            className="flex items-center gap-2 py-3 shrink-0 hover:text-red-400 transition"
            onClick={() => setMenuOpen((v) => !v)}
            type="button"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
            <span className="text-sm font-medium">All Categories</span>
          </button>
        </div>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute left-0 top-full w-full z-50">
              <div className="max-w-7xl mx-auto px-4">
                <div className="bg-white text-gray-900 rounded-2xl shadow-xl border border-gray-200 overflow-hidden mt-3 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                    <div>
                      <p className="font-semibold leading-tight">Browse Categories</p>
                      <p className="text-xs text-gray-500">Choose a category to explore products</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMenuOpen(false)}
                      className="p-2 rounded-lg hover:bg-gray-200 transition"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {NAV_CATEGORIES.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/products?category=${encodeURIComponent(cat.slug)}`}
                          onClick={() => setMenuOpen(false)}
                          className="group rounded-xl border border-gray-200 bg-white p-3 hover:border-red-300 hover:shadow-sm transition flex items-center justify-between"
                        >
                          <span className="text-sm font-medium text-gray-800 group-hover:text-red-600">
                            {cat.name}
                          </span>
                          <ChevronRight size={16} className="text-gray-400 group-hover:text-red-500 transition" />
                        </Link>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-end">
                      <Link
                        href="/products"
                        onClick={() => setMenuOpen(false)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        View all products
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </nav>
    </header>
  )
}