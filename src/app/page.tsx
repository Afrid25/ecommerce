"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = ["All", ...new Set(products.map((p) => p.category))];
  const filtered =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="bg-white dark:bg-black">
      {/* Hero Section */}
      <section className="relative w-full min-h-[70vh] md:h-[600px] flex items-center justify-center overflow-hidden bg-black dark:bg-white">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40 dark:from-white/60 dark:to-white/40 z-10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1200 600%22><defs><pattern id=%22grid%22 width=%2240%22 height=%2240%22 patternUnits=%22userSpaceOnUse%22><path d=%22M 40 0 L 0 0 0 40%22 fill=%22none%22 stroke=%22rgba(255,255,255,0.05)%22 stroke-width=%221%22/></pattern></defs><rect width=%221200%22 height=%22600%22 fill=%22black%22/><rect width=%221200%22 height=%22600%22 fill=%22url(%23grid)%22/></svg>')] opacity-30"></div>

        {/* Content */}
        <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6 md:space-y-8">
            {/* Badge */}
            <div className="inline-block">
              <span className="text-xs md:text-sm font-bold tracking-widest uppercase text-white dark:text-black opacity-80">
                New Collection
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white dark:text-black leading-none">
              Discover <br /> Premium Quality
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-white/80 dark:text-black/80 max-w-2xl mx-auto leading-relaxed">
              Experience excellence with our curated collection. Fast delivery across Bangladesh with flexible payment options.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <a
                href="#products"
                className="btn-primary bg-white text-black hover:bg-gray-100 dark:bg-black dark:text-white dark:hover:bg-gray-900"
              >
                Shop Now
              </a>
              <a
                href="#products"
                className="btn-secondary text-white border-white hover:bg-white hover:text-black dark:text-black dark:border-black dark:hover:bg-black dark:hover:text-white"
              >
                Explore Collection
              </a>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <svg className="w-6 h-6 text-white dark:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-32">
        {/* Section Header */}
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Featured Products
          </h2>
          <p className="text-lg opacity-60 max-w-2xl">
            Handpicked selection of premium items for every need.
          </p>
        </div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="mb-12 flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 text-sm font-semibold tracking-wide transition-all duration-300 ${
                  selectedCategory === cat
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-gray-100 dark:bg-gray-900 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="skeleton aspect-square w-full"></div>
                <div className="skeleton h-4 w-1/3"></div>
                <div className="skeleton h-5 w-2/3"></div>
                <div className="skeleton h-4 w-full"></div>
                <div className="skeleton h-12 w-full"></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto opacity-20 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="text-2xl font-bold mb-2">No products found</h3>
            <p className="opacity-60">Products will appear here once added by the admin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-black dark:bg-white text-white dark:text-black py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
            Ready to Shop?
          </h2>
          <p className="text-lg opacity-80 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers. Free shipping on orders over ৳5,000.
          </p>
          <a href="#products" className="btn-primary bg-white text-black hover:bg-gray-100 dark:bg-black dark:text-white dark:border-white dark:hover:bg-gray-900">
            Start Shopping
          </a>
        </div>
      </section>
    </div>
  );
}
