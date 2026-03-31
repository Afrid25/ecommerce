"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useToastStore } from "@/store/toast";

type Props = {
  productId: number;
};

function ReviewStars({
  rating,
  onChange,
}: {
  rating: number;
  onChange: (rating: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {Array.from({ length: 5 }).map((_, index) => {
        const value = index + 1;
        const active = value <= rating;

        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className={`text-2xl transition ${
              active ? "text-[#FF8A00]" : "text-[#d1d5db]"
            }`}
            aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
          >
            ★
          </button>
        );
      })}
      <span className="text-sm font-semibold text-[var(--text-secondary)]">{rating}/5</span>
    </div>
  );
}

export default function ProductReviewForm({ productId }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const showToast = useToastStore((state) => state.showToast);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    userName: "",
    rating: 5,
    comment: "",
    images: [] as string[],
  });

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }

    const remainingSlots = Math.max(0, 4 - form.images.length);
    const selectedFiles = Array.from(files).slice(0, remainingSlots);

    if (selectedFiles.length === 0) {
      showToast("You can upload up to 4 review images.", "error");
      return;
    }

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of selectedFiles) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);

        const response = await fetch("/api/reviews/upload", {
          method: "POST",
          body: uploadFormData,
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok || typeof data.url !== "string") {
          throw new Error(data.error || "Failed to upload review image");
        }

        uploadedUrls.push(data.url);
      }

      setForm((current) => ({
        ...current,
        images: [...current.images, ...uploadedUrls],
      }));
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to upload review image", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setSubmitting(true);

        try {
          const response = await fetch("/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId,
              ...form,
            }),
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            showToast(data.error || "Failed to submit review", "error");
            return;
          }
          showToast("Review submitted for moderation.", "success");
          setForm({
            userName: "",
            rating: 5,
            comment: "",
            images: [],
          });
        } finally {
          setSubmitting(false);
        }
      }}
      className="mt-8 space-y-5 rounded-[28px] bg-[var(--surface)] p-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-semibold">Your Name</label>
          <input
            required
            value={form.userName}
            onChange={(event) => setForm({ ...form, userName: event.target.value })}
            placeholder="Enter your name"
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold">Your Rating</label>
          <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
            <ReviewStars rating={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold">Your Review</label>
        <textarea
          required
          value={form.comment}
          onChange={(event) => setForm({ ...form, comment: event.target.value })}
          rows={5}
          placeholder="Share your experience with the product"
          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3"
        />
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <label className="block text-sm font-semibold">Review Images</label>
            <p className="text-xs leading-6 text-[var(--text-secondary)]">
              Upload up to 4 photos to help other customers evaluate the product.
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            multiple
            className="hidden"
            onChange={(event) => void handleUpload(event.target.files)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || form.images.length >= 4}
            className="rounded-full border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? "Uploading..." : "Upload Photos"}
          </button>
        </div>

        {form.images.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {form.images.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className="overflow-hidden rounded-[1.25rem] border border-[var(--border)] bg-white p-2"
              >
                <div className="relative aspect-square overflow-hidden rounded-[1rem]">
                  <Image
                    src={image}
                    alt={`Review upload ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      images: current.images.filter((_, imageIndex) => imageIndex !== index),
                    }))
                  }
                  className="mt-2 w-full text-xs font-semibold text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={submitting || uploading}
        className="rounded-full bg-[#16311a] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
