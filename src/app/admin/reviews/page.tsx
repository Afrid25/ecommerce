"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import { useSession } from "@/lib/auth-client";
import { useToastStore } from "@/store/toast";

type Review = {
  id: number;
  productId: number;
  customerName: string;
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function AdminReviewsPage() {
  const { data: session, isPending } = useSession();
  const showToast = useToastStore((s) => s.showToast);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (!session) return;
    loadReviews();
  }, [session]);

  const loadReviews = async () => {
    try {
      const res = await fetch("/api/reviews");
      const data = await res.json();
      setReviews(res.ok ? data : []);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    const res = await fetch(`/api/reviews/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      showToast(`Review ${status}`, "success");
      loadReviews();
    } else {
      showToast("Failed to update review", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this review?")) return;
    const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Review deleted", "success");
      loadReviews();
    } else {
      showToast("Failed to delete review", "error");
    }
  };

  if (isPending || !session) return null;

  const filtered = filterStatus === "all" ? reviews : reviews.filter((r) => r.status === filterStatus);

  return (
    <AdminShell title="Review Management" subtitle="Approve, reject, or delete customer reviews.">
      <div className="mb-6 flex flex-wrap gap-3">
        {["all", "pending", "approved", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${
              filterStatus === status ? "bg-[#16311a] text-white" : "bg-[var(--surface)]"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24" />)}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-sm text-[var(--text-secondary)] py-12">No reviews found.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((review) => (
            <article key={review.id} className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{review.customerName}</h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusColors[review.status] || "bg-gray-100"}`}>
                      {review.status}
                    </span>
                    <span className="text-sm text-[var(--text-secondary)]">Product #{review.productId}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`text-lg ${i < review.rating ? "text-yellow-400" : "text-gray-200"}`}>★</span>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">{review.comment}</p>
                  <p className="mt-2 text-xs text-[var(--text-secondary)]">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {review.status !== "approved" && (
                    <button
                      onClick={() => handleUpdateStatus(review.id, "approved")}
                      className="rounded-xl bg-green-50 px-4 py-2 text-sm font-medium text-green-700"
                    >
                      Approve
                    </button>
                  )}
                  {review.status !== "rejected" && (
                    <button
                      onClick={() => handleUpdateStatus(review.id, "rejected")}
                      className="rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-700"
                    >
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="rounded-xl border border-red-200 px-4 py-2 text-sm text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
