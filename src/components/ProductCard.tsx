"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";
import WishlistButton from "./WishlistButton";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

interface ProductCardProps {
  product: Product;
  showQuickAdd?: boolean;
}

export default function ProductCard({ product, showQuickAdd = true }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        stock: product.stock,
      });
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300">
      {/* Wishlist Button - Always visible on hover */}
      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <WishlistButton 
          productId={product.id} 
          productName={product.name}
          productPrice={product.price}
          productImage={product.image}
          productCategory={product.category}
          size="sm" 
        />
      </div>

      {/* Product Image */}
      <Link href={`/product/${product.id}`}>
        <div className="aspect-square overflow-hidden bg-gray-100 relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-900 px-4 py-2 rounded-full font-semibold text-sm">
                Out of Stock
              </span>
            </div>
          )}

          {/* Discount Badge */}
          {!isOutOfStock && product.stock < 10 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              Low Stock
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        <Link href={`/products?category=${encodeURIComponent(product.category)}`}>
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full inline-block mb-2 hover:bg-indigo-100 transition-colors">
            {product.category}
          </span>
        </Link>

        {/* Product Name */}
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1 text-lg">
            {product.name}
          </h3>
        </Link>

        {/* Rating (Mock) */}
        <div className="flex items-center gap-1 mt-1.5">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 ${i < 4 ? "text-yellow-400" : "text-gray-300"}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-xs text-gray-400 ml-1">(42)</span>
        </div>

        {/* Price & Stock */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">৳{product.price.toLocaleString()}</span>
          </div>
          <span className={`text-xs font-medium ${isOutOfStock ? "text-red-500" : "text-green-600"}`}>
            {isOutOfStock ? "Out of Stock" : `${product.stock} in stock`}
          </span>
        </div>

        {/* Quick Add Button - Shows on hover */}
        {showQuickAdd && (
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`
              mt-4 w-full py-3 rounded-xl font-semibold transition-all duration-300
              ${isOutOfStock 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5"
              }
              opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0
            `}
          >
            {isOutOfStock ? "Out of Stock" : "Quick Add to Cart"}
          </button>
        )}

        {/* Mobile: Always show add to cart button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`
            mt-4 w-full py-3 rounded-xl font-semibold transition-all duration-300 lg:hidden
            ${isOutOfStock 
              ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
              : "bg-indigo-600 text-white"
            }
          `}
        >
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
