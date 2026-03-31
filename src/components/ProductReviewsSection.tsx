"use client";

import Image from "next/image";
import { useState } from "react";
import ProductReviewForm from "@/components/ProductReviewForm";

type Review = {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: string | Date;
};

type Props = {
  productId: number;
  reviews: Review[];
};

const PAGE_SIZE = 4;

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={index < rating ? "text-[#FF8A00]" : "text-[#d1d5db]"}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function ProductReviewsSection({ productId, reviews }: Props) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(reviews.length / PAGE_SIZE));
  const paginatedReviews = reviews.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  return (
    <section className="mt-16 rounded-[36px] border border-[var(--border)] bg-white/80 p-6 shadow-[var(--shadow-soft)] dark:bg-white/5 lg:p-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="section-eyebrow">Customer Reviews</p>
          <h2 className="section-title">Customer Reviews</h2>
        </div>
        <div className="rounded-[1.5rem] bg-[var(--surface)] px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]">
            Average Rating
          </p>
          <div className="mt-2 flex items-center gap-3">
            <RatingStars rating={Math.round(averageRating)} />
            <span className="text-sm font-semibold text-[var(--text-secondary)]">
              {reviews.length > 0 ? averageRating.toFixed(1) : "No ratings yet"}
            </span>
          </div>
        </div>
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-5">
          {paginatedReviews.map((review) => (
            <article key={review.id} className="rounded-[28px] bg-[var(--surface)] p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">{review.userName}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <RatingStars rating={review.rating} />
                    <span className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">{review.comment}</p>

              {review.images.length > 0 ? (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {review.images.map((image, index) => (
                    <div
                      key={`${review.id}-${index}`}
                      className="relative aspect-square overflow-hidden rounded-[1rem]"
                    >
                      <Image
                        src={image}
                        alt={`${review.userName} review image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          ))}

          {totalPages > 1 ? (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: totalPages }).map((_, index) => {
                const nextPage = index + 1;
                return (
                  <button
                    key={nextPage}
                    type="button"
                    onClick={() => setPage(nextPage)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      page === nextPage
                        ? "bg-[#16311a] text-white"
                        : "border border-[var(--border)] bg-white"
                    }`}
                  >
                    {nextPage}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-[28px] bg-[var(--surface)] p-6 text-sm text-[var(--text-secondary)]">
          No approved reviews yet. Be the first customer to leave feedback after delivery.
        </div>
      )}

      <ProductReviewForm productId={productId} />
    </section>
  );
}
