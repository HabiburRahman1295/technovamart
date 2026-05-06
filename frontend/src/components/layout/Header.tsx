"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  User,
  Heart,
  Phone,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";
import { useCartStore, useAuthStore } from "@/store";
import { useRouter } from "next/navigation";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const cartItems = useCartStore((s) => s.items);
  const cartTotalItems = useCartStore((s) => s.totalItems);
  const hasHydrated = useCartStore((s) => s._hasHydrated);
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  // ✅ Ensure component only renders after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalItems = isMounted && hasHydrated ? cartTotalItems() : 0;

  const accountRef = useRef<HTMLDivElement | null>(null);

  // ✅ Close account dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!accountRef.current) return;
      if (!accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/products");
    }
  };

  const NAV_CATEGORIES = [
    { name: "Smartphone", slug: "smartphone" },
    { name: "Laptop", slug: "laptop" },
    { name: "Tablet", slug: "tablet" },
    { name: "Earbuds", slug: "earbuds" },
    { name: "Smartwatch", slug: "smartwatch" },
    { name: "Gaming", slug: "gaming" },
    { name: "Accessories", slug: "accessories" },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top bar - Hidden on mobile, visible on md and up */}
      <div className="hidden md:block bg-red-600 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="flex items-center gap-1">
            <Phone size={12} /> Hotline: 01410732067
          </span>
          <span>🚀 Same-day delivery in Dhaka!</span>
        </div>
      </div>

      {/* Main header */}
      <div className="px-4 py-2 md:py-3">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Layout - Stack on small screens */}
          <div className="flex md:hidden items-center gap-2 mb-2">
            {/* Logo - always visible */}
            <Link href="/" className="flex items-center gap-1 shrink-0">
              <div className="bg-red-600 text-white font-bold rounded-lg p-1">
                <Image
                  src="/photo/tech-logo.jpg"
                  alt="TechNova"
                  width={32}
                  height={32}
                />
              </div>
            </Link>

            {/* Search on mobile - compact */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-red-500 focus-within:border-transparent">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="flex-1 px-2 py-2 text-xs outline-none"
                />
                <button
                  type="submit"
                  className="bg-red-600 text-white px-2 hover:bg-red-700 transition"
                >
                  <Search size={16} />
                </button>
              </div>
            </form>

            {/* Cart badge on mobile */}
            <Link
              href="/cart"
              className="relative flex items-center text-gray-600 hover:text-red-600 transition"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Desktop Layout - Horizontal on large screens */}
          <div className="hidden md:flex items-center gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="bg-red-600 text-white font-bold text-lg px-1 py-1 rounded-lg">
                <Image
                  src="/photo/tech-logo.jpg"
                  alt="TechNova"
                  width={40}
                  height={40}
                />
              </div>
              <div>
                <div className="font-bold text-gray-900 leading-tight">
                  TechNova
                </div>
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

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/cart"
                className="flex flex-col items-center text-gray-600 hover:text-red-600 transition relative"
              >
                <ShoppingCart size={22} />
                <span className="text-xs mt-0.5">Cart</span>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </Link>

              {isAuthenticated ? (
                <div className="relative" ref={accountRef}>
                  <button
                    className="flex flex-col items-center text-gray-600 hover:text-red-600 transition"
                    type="button"
                    onClick={() => setAccountOpen((v) => !v)}
                  >
                    <User size={22} />
                    <span className="text-xs mt-0.5">Account</span>
                  </button>

                  {accountOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-lg w-48 md:w-52 py-2 border z-50">
                      <div className="px-4 py-2 text-xs md:text-sm text-gray-500 border-b truncate">
                        {user?.email}
                      </div>

                      <Link
                        href="/account/profile"
                        className="flex items-center gap-2 px-4 py-2 text-xs md:text-sm hover:bg-gray-50"
                        onClick={() => setAccountOpen(false)}
                      >
                        <User size={14} /> My Profile
                      </Link>

                      <Link
                        href="/account/orders"
                        className="flex items-center gap-2 px-4 py-2 text-xs md:text-sm hover:bg-gray-50"
                        onClick={() => setAccountOpen(false)}
                      >
                        <ShoppingCart size={14} /> My Orders
                      </Link>

                      {(user as any)?.is_staff && (
                        <Link
                          href="/admin-login"
                          className="flex items-center gap-2 px-4 py-2 text-xs md:text-sm hover:bg-gray-50 text-red-600 font-medium"
                          onClick={() => setAccountOpen(false)}
                        >
                          <LayoutDashboard size={14} /> Admin Panel
                        </Link>
                      )}

                      <div className="border-t mt-1">
                        <button
                          onClick={() => {
                            logout();
                            setAccountOpen(false);
                            router.push("/");
                          }}
                          className="w-full text-left px-4 py-2 text-xs md:text-sm text-red-600 hover:bg-gray-50"
                          type="button"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex flex-col items-center text-gray-600 hover:text-red-600 transition"
                >
                  <User size={22} />
                  <span className="text-xs mt-0.5">Login</span>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Account/Login Button */}
          <div className="md:hidden">
            {isAuthenticated ? (
              <div className="relative" ref={accountRef}>
                <button
                  className="text-gray-600 hover:text-red-600 transition p-1"
                  type="button"
                  onClick={() => setAccountOpen((v) => !v)}
                >
                  <User size={20} />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-lg w-44 py-2 border z-50">
                    <div className="px-3 py-2 text-xs text-gray-500 border-b truncate">
                      {user?.email}
                    </div>

                    <Link
                      href="/account/profile"
                      className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50"
                      onClick={() => setAccountOpen(false)}
                    >
                      <User size={14} /> Profile
                    </Link>

                    <Link
                      href="/account/orders"
                      className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50"
                      onClick={() => setAccountOpen(false)}
                    >
                      <ShoppingCart size={14} /> Orders
                    </Link>

                    {(user as any)?.is_staff && (
                      <Link
                        href="/admin-login"
                        className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 text-red-600 font-medium"
                        onClick={() => setAccountOpen(false)}
                      >
                        <LayoutDashboard size={14} /> Admin
                      </Link>
                    )}

                    <div className="border-t mt-1">
                      <button
                        onClick={() => {
                          logout();
                          setAccountOpen(false);
                          router.push("/");
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-gray-50"
                        type="button"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="text-gray-600 hover:text-red-600 transition p-1"
              >
                <User size={20} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="bg-gray-900 text-white">
        <div className="px-4">
          <div className="max-w-7xl mx-auto flex items-center">
            {/* All Categories button */}
            <button
              className="flex items-center gap-2 py-2.5 md:py-3 shrink-0 hover:text-red-400 transition"
              onClick={() => setMenuOpen((v) => !v)}
              type="button"
            >
              {menuOpen ? (
                <X size={16} className="md:size-18" />
              ) : (
                <Menu size={16} className="md:size-18" />
              )}
              <span className="text-xs md:text-sm font-medium">Categories</span>
            </button>
          </div>

          {/* ✅ Beautiful dropdown under Categories - Fully Responsive */}
          {menuOpen && (
            <>
              {/* overlay */}
              <div
                className="fixed inset-0 bg-black/30 z-40"
                onClick={() => setMenuOpen(false)}
              />

              {/* dropdown container */}
              <div className="absolute left-0 top-full w-full z-50">
                <div className="px-4">
                  <div className="max-w-7xl mx-auto bg-white text-gray-900 rounded-2xl shadow-xl border border-gray-200 overflow-hidden mt-2 animate-in fade-in zoom-in-95 duration-150">
                    {/* header */}
                    <div className="flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 border-b bg-gray-50">
                      <div>
                        <p className="font-semibold text-sm md:text-base leading-tight">
                          Browse Categories
                        </p>
                        <p className="text-xs text-gray-500">
                          Choose a category to explore products
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMenuOpen(false)}
                        className="p-1.5 md:p-2 rounded-lg hover:bg-gray-200 transition"
                        aria-label="Close categories"
                      >
                        <X size={18} className="md:size-5" />
                      </button>
                    </div>

                    {/* items */}
                    <div className="p-3 md:p-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
                        {NAV_CATEGORIES.map((cat) => (
                          <Link
                            key={cat.slug}
                            href={`/products?category=${encodeURIComponent(cat.slug)}`}
                            onClick={() => setMenuOpen(false)}
                            className="group rounded-lg md:rounded-xl border border-gray-200 bg-white p-2 md:p-3 hover:border-red-300 hover:shadow-sm transition flex items-center justify-between"
                          >
                            <span className="text-xs md:text-sm font-medium text-gray-800 group-hover:text-red-600">
                              {cat.name}
                            </span>
                            <ChevronRight
                              size={14}
                              className="text-gray-400 group-hover:text-red-500 transition md:size-4"
                            />
                          </Link>
                        ))}
                      </div>

                      <div className="mt-3 md:mt-4 flex items-center justify-end">
                        <Link
                          href="/products"
                          onClick={() => setMenuOpen(false)}
                          className="text-xs md:text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                          View all products →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
