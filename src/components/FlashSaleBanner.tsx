"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface FlashSaleProduct {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  discount: number;
}

interface FlashSaleBannerProps {
  products?: FlashSaleProduct[];
}

export default function FlashSaleBanner({ products = [] }: FlashSaleBannerProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 23, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  // Default flash sale products if none provided
  const defaultProducts: FlashSaleProduct[] = products.length > 0 ? products : [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 2499,
      originalPrice: 4999,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
      discount: 50,
    },
    {
      id: 2,
      name: "Smart Watch Series 5",
      price: 3999,
      originalPrice: 7999,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
      discount: 50,
    },
    {
      id: 3,
      name: "Bluetooth Speaker",
      price: 1499,
      originalPrice: 2999,
      image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400",
      discount: 50,
    },
  ];

  return (
    <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white overflow-hidden">
      {/* Main Banner */}
      <div className="relative">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiLz48L2c+PC9zdmc+')] animate-pulse" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Left Side - Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-4">
                <span className="animate-pulse">⚡</span>
                <span className="font-bold text-sm uppercase tracking-wider">Flash Sale</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-2">
                Up to 50% Off!
              </h2>
              <p className="text-red-100 mb-4">
                Limited time offers on premium products. Grab them before they are gone!
              </p>
              
              {/* Countdown Timer */}
              <div className="flex justify-center lg:justify-start gap-2">
                {[
                  { value: timeLeft.hours, label: "Hours" },
                  { value: timeLeft.minutes, label: "Mins" },
                  { value: timeLeft.seconds, label: "Secs" },
                ].map((item, index) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-center min-w-[60px]">
                      <div className="text-2xl font-bold">
                        {String(item.value).padStart(2, "0")}
                      </div>
                      <div className="text-xs text-red-100">{item.label}</div>
                    </div>
                    {index < 2 && <span className="text-xl font-bold">:</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Products */}
            <div className="flex gap-4 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto">
              {defaultProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="flex-shrink-0 bg-white rounded-xl p-3 min-w-[180px] hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                    />
                    <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                      -{product.discount}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 truncate">{product.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-red-600">৳{product.price}</span>
                    <span className="text-xs text-gray-400 line-through">৳{product.originalPrice}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 p-2 hover:bg-white/20 rounded-full transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
