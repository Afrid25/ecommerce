"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import { useSession } from "@/lib/auth-client";
import { useToastStore } from "@/store/toast";

type Review = {
  id: number;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  status: string;
  productId: number;
  createdAt: string;
  images: string[];
};

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className={index < rating ? "text-[#FF8A00]" : "text-[#d1d5db]"}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const { data: session, isPending } = useSession();
  const showToast = useToastStore((state) => state.showToast);
  const [reviews, setReviews] = useState<Review[]>([]);

  const refresh = async () => {
    const response = await fetch("/api/reviews?admin=1", { cache: "no-store" });
    const data = await response.json().catch(() => []);
    setReviews(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    if (!session) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      const response = await fetch("/api/reviews?admin=1", { cache: "no-store" });
      const data = await response.json().catch(() => []);
      if (!cancelled) {
        setReviews(Array.isArray(data) ? data : []);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [session]);

  if (isPending || !session) {
    return null;
  }

  return (
    <AdminShell
      title="Reviews"
      subtitle="Approve genuine product feedback, view customer photos, and remove spam or low-quality submissions."
    >
      <div className="space-y-4">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                  Product #{review.productId} · {review.status}
                </p>
                <h3 className="mt-2 text-xl font-semibold">{review.title}</h3>
              </div>
              <div className="text-right">
                <RatingStars rating={review.rating} />
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{review.comment}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              {review.userName}
            </p>

            {review.images.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
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

            <div className="mt-4 flex gap-3">
              <button
                onClick={async () => {
                  await fetch(`/api/reviews/${review.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "approved" }),
                  });
                  showToast("Review approved.", "success");
                  void refresh();
                }}
                className="rounded-full bg-[#16311a] px-4 py-2 text-sm font-semibold text-white"
              >
                Approve
              </button>
              <button
                onClick={async () => {
                  await fetch(`/api/reviews/${review.id}`, { method: "DELETE" });
                  showToast("Review deleted.", "info");
                  void refresh();
                }}
                className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
