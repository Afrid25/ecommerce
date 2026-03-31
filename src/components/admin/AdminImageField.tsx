"use client";

import { useId, useRef, useState } from "react";
import { AdminField, adminInputClassName } from "@/components/admin/AdminField";
import { useToastStore } from "@/store/toast";

type AdminImageFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
  placeholder?: string;
  uploadFolder?: string;
};

function normalizePreviewValue(value: string) {
  if (!value.trim()) {
    return "";
  }

  return value.trim();
}

export default function AdminImageField({
  label,
  value,
  onChange,
  helperText,
  placeholder = "Paste an image URL or upload a file from your device",
  uploadFolder = "generic",
}: AdminImageFieldProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const showToast = useToastStore((state) => state.showToast);
  const [isUploading, setIsUploading] = useState(false);

  async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", uploadFolder);

    setIsUploading(true);

    try {
      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || typeof data.url !== "string") {
        throw new Error(data.error || "Upload failed");
      }

      onChange(data.url);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Image upload failed. Please try again.";
      showToast(message, "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  const previewValue = normalizePreviewValue(value);

  return (
    <AdminField label={label} htmlFor={inputId} helperText={helperText}>
      <div className="space-y-3">
        <input
          id={inputId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={adminInputClassName}
        />
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void uploadFile(file);
              }
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[#16311a] transition hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? "Uploading..." : "Upload From Device"}
          </button>
          {previewValue ? (
            <span className="text-xs text-[var(--text-secondary)]">
              Saved path: {previewValue}
            </span>
          ) : null}
        </div>
        {previewValue ? (
          <div className="overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewValue}
              alt={`${label} preview`}
              className="h-48 w-full rounded-[1rem] object-cover"
            />
          </div>
        ) : null}
      </div>
    </AdminField>
  );
}
