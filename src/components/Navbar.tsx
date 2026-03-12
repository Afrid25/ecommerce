"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const getTotalItems = useCartStore((s) => s.getTotalItems);

  useEffect(() => setMounted(true), []);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold tracking-tight">
            ShopBD
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium hover:text-gray-600 dark:hover:text-gray-300 transition">
              Shop
            </Link>
            <Link href="/" className="text-sm font-medium hover:text-gray-600 dark:hover:text-gray-300 transition">
              New Arrivals
            </Link>
            <Link href="/" className="text-sm font-medium hover:text-gray-600 dark:hover:text-gray-300 transition">
              Sale
            </Link>
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Cart */}
            <Link href="/cart" className="relative group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {mounted && getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {/* Admin */}
            <Link
              href="/admin"
              className="text-sm font-medium px-4 py-2 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition"
            >
              Admin
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Mobile Cart */}
            <Link href="/cart" className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {mounted && getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 py-4 space-y-4">
            <Link href="/" className="block text-sm font-medium hover:text-gray-600 dark:hover:text-gray-300">
              Shop
            </Link>
            <Link href="/" className="block text-sm font-medium hover:text-gray-600 dark:hover:text-gray-300">
              New Arrivals
            </Link>
            <Link href="/" className="block text-sm font-medium hover:text-gray-600 dark:hover:text-gray-300">
              Sale
            </Link>
            <Link href="/admin" className="block text-sm font-medium hover:text-gray-600 dark:hover:text-gray-300">
              Admin
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
