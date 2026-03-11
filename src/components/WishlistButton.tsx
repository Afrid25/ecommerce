"use client";

import { useState, useEffect } from "react";
import { useWishlistStore } from "@/store/wishlist";

interface WishlistButtonProps {
  productId: number;
  productName?: string;
  productPrice?: number;
  productImage?: string;
  productCategory?: string;
  size?: "sm" | "md" | "lg";
}

export default function WishlistButton({ 
  productId, 
  productName, 
  productPrice = 0, 
  productImage = "",
  productCategory = "",
  size = "md" 
}: WishlistButtonProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { items, addItem, removeItem, isInWishlist } = useWishlistStore();
  
  const isWishlisted = isMounted && isInWishlist(productId);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAnimating(true);
    
    if (isWishlisted) {
      removeItem(productId);
    } else {
      addItem({
        id: productId,
        name: productName || "Product",
        price: productPrice,
        image: productImage,
        category: productCategory || "",
      });
    }
    
    setTimeout(() => setIsAnimating(false), 300);
  };

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10", 
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  if (!isMounted) {
    // Return a placeholder to avoid hydration mismatch
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-white/90 backdrop-blur-sm shadow-md`} />
    );
  }

  return (
    <button
      onClick={handleWishlist}
      className={`
        ${sizeClasses[size]} 
        flex items-center justify-center 
        rounded-full 
        bg-white/90 backdrop-blur-sm
        shadow-md
        transition-all duration-300
        hover:shadow-lg
        ${isAnimating ? "scale-125" : "scale-100"}
        ${isWishlisted 
          ? "text-red-500 hover:text-red-600" 
          : "text-gray-400 hover:text-red-500"
        }
      `}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`${iconSizes[size]} transition-transform duration-300`}
        fill={isWishlisted ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
