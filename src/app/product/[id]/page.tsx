"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useCartStore } from "@/store/cart";
import Link from "next/link";
import ProductReviews from "@/components/ProductReviews";
import ProductCard from "@/components/ProductCard";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  createdAt: string;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    // Fetch product details
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        // Fetch related products (same category)
        return fetch("/api/products");
      })
      .then((res) => res.json())
      .then((data) => {
        if (product) {
          const related = (Array.isArray(data) ? data : [])
            .filter((p: Product) => p.category === product.category && p.id !== product.id)
            .slice(0, 4);
          setRelatedProducts(related);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, product?.category]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        stock: product.stock,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
        <Link href="/" className="text-indigo-600 mt-4 inline-block hover:underline">
          ← Back
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-indigo-600">Products</Link>
        <span>/</span>
        <Link href={`/products?category=${product?.category}`} className="hover:text-indigo-600">{product?.category}</Link>
        <span>/</span>
        <span className="text-gray-900 truncate">{product?.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100 dark:bg-slate-800">
            <img
              src={product?.image}
              alt={product?.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <span className="text-sm font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
              {product?.category}
            </span>
          </div>
          
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            {product?.name}
          </h1>
          
          <p className="text-3xl font-bold text-indigo-600">
            ৳{product?.price.toLocaleString()}
          </p>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${product && product.stock > 0 ? "bg-green-500" : "bg-red-500"}`} />
            <span className={`text-sm font-medium ${product && product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
              {product?.stock && product.stock > 0 
                ? `${product.stock} items in stock` 
                : "Out of stock"}
            </span>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-4 py-4 border-y border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              100% Authentic
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Secure Payment
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Easy Returns
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {product?.description}
          </p>

          {product && product.stock > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity:</label>
                <div className="flex items-center border border-gray-300 dark:border-slate-600 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                  >
                    -
                  </button>
                  <span className="px-6 py-2 border-x border-gray-300 dark:border-slate-600">{quantity}</span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl hover:bg-indigo-700 transition font-semibold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {added ? "✓ Added to Cart!" : "Add to Cart"}
              </button>

              <Link
                href="/cart"
                className="block text-center w-full border-2 border-indigo-600 text-indigo-600 py-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition font-semibold"
              >
                View Cart
              </Link>
            </div>
          )}

          {/* Payment Methods */}
          <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Payment Methods</h3>
            <div className="flex flex-wrap gap-3">
              <span className="bg-gray-100 dark:bg-slate-700 px-4 py-2 rounded-full text-sm dark:text-gray-300">💵 Cash on Delivery</span>
              <span className="bg-pink-50 dark:bg-pink-900/30 px-4 py-2 rounded-full text-sm text-pink-700 dark:text-pink-400">📱 bKash</span>
              <span className="bg-orange-50 dark:bg-orange-900/30 px-4 py-2 rounded-full text-sm text-orange-700 dark:text-orange-400">📱 Nagad</span>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              Free delivery on orders over ৳1500
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Delivery within 3-7 business days
            </div>
          </div>
        </div>
      </div>

      {/* Product Reviews */}
      {product && (
        <div className="mt-16">
          <ProductReviews productId={product.id} />
        </div>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Related Products
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
