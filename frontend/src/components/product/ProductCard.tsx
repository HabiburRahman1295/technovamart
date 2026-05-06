"use client";

import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart } from "lucide-react";
import { useCartStore } from "@/store";
import toast from "react-hot-toast";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  discount_price?: number;
  effective_price: number;
  discount_percent: number;
  in_stock: boolean;
  brand_name: string;
  category_name: string;
  primary_image?: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  // ✅ Backend now returns absolute URLs, so use directly
  const imageSrc = product.primary_image || null;

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    addItem({
      product_id: product.id,
      product_name: product.name,
      price: product.effective_price,
      quantity: 1,
      image: imageSrc || undefined, // ✅ store absolute image url in cart
      slug: product.slug,
    });

    const shortName =
      product.name.length > 30
        ? `${product.name.slice(0, 30)}...`
        : product.name;

    toast.success(`"${shortName}" added to cart!`);
  };

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <div className="card overflow-hidden hover:shadow-md transition-all duration-200 h-full flex flex-col">
        {/* Image */}
        <div className="relative overflow-hidden bg-gray-50 aspect-square">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
              📦
            </div>
          )}

          {product.discount_percent > 0 && (
            <span className="absolute top-2 left-2 badge-discount">
              -{product.discount_percent}%
            </span>
          )}

          {!product.in_stock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded-full">
                Out of Stock
              </span>
            </div>
          )}

          <button
            onClick={(e) => {
              e.preventDefault();
              toast("Wishlist coming soon!");
            }}
            className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow opacity-0 group-hover:opacity-100 transition hover:text-red-600"
            aria-label="Add to wishlist"
            type="button"
          >
            <Heart size={16} />
          </button>
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col flex-1">
          <p className="text-xs text-gray-400 mb-1">{product.brand_name}</p>

          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 flex-1 mb-2 group-hover:text-red-600 transition">
            {product.name}
          </h3>

          <div className="flex items-center gap-2 mb-3">
            <span className="price-main">
              ৳{product.effective_price.toLocaleString("en-IN")}
            </span>
            {!!product.discount_price && (
              <span className="price-original">
                ৳{product.price.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.in_stock}
            className="w-full btn-primary flex items-center justify-center gap-2 text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            <ShoppingCart size={16} />
            {product.in_stock ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </Link>
  );
}
