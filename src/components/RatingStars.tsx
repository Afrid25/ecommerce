"use client";

interface RatingStarsProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function RatingStars({ 
  rating = 0, 
  size = "md", 
  className = "" 
}: RatingStarsProps) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);
  
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  return (
    <div className={`flex items-center gap-1 ${sizeClasses[size]} ${className}`}>
      {stars.map((star) => (
        <span key={star}>
          {star <= Math.floor(rating) ? "★" : 
           star <= rating ? "☆" : "☆"}
        </span>
      ))}
    </div>
  );
}
