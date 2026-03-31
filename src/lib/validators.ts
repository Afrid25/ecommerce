import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().min(1, "Description is required"),
  price: z.number().finite().min(0, "Price must be a non-negative number"),
  compareAtPrice: z.number().finite().min(0).nullable().optional(),
  costPrice: z.number().finite().min(0, "Cost price must be a non-negative number").default(0),
  image: z.string().trim().min(1, "Image is required"),
  category: z.string().trim().optional().default(""),
  categorySlug: z.string().trim().min(1, "Category slug is required"),
  stock: z.number().int().min(0, "Stock must be a non-negative integer"),
  isFeatured: z.boolean().optional().default(false),
  isTrending: z.boolean().optional().default(false),
  isHot: z.boolean().optional().default(false),
  isLimited: z.boolean().optional().default(false),
});

const checkoutItemSchema = z.object({
  productId: z.number().int().positive("Product ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(1, "Customer name is required"),
  customerEmail: z.union([z.string().trim().email("Enter a valid email address"), z.literal("")]).optional(),
  phone: z.string().trim().min(1, "Phone number is required"),
  address: z.string().trim().min(1, "Address is required"),
  paymentMethod: z.enum(["cod", "bkash", "nagad", "cash", "offline"]),
  mobileWalletNumber: z.string().trim().optional(),
  otpCode: z.string().trim().optional(),
  paymentReference: z.string().trim().optional(),
  source: z.enum(["online", "manual"]).default("online"),
  notes: z.string().trim().optional(),
  items: z.array(checkoutItemSchema).min(1, "At least one item is required"),
}).superRefine((data, ctx) => {
  if (data.paymentMethod === "bkash" || data.paymentMethod === "nagad") {
    if (!data.mobileWalletNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Mobile wallet number is required for bKash or Nagad",
        path: ["mobileWalletNumber"],
      });
    }

    if (!data.otpCode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "OTP verification code is required for bKash or Nagad",
        path: ["otpCode"],
      });
    }
  }
});

export const orderStatusSchema = z.object({
  orderStatus: z.enum([
    "pending",
    "pending_payment",
    "processing",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
  ]),
});

export const reviewSchema = z.object({
  productId: z.number().int().positive("Product ID is required"),
  userName: z.string().trim().min(1, "Your name is required").max(80, "Name is too long"),
  rating: z.number().int().min(1, "Rating is required").max(5, "Rating must be between 1 and 5"),
  comment: z
    .string()
    .trim()
    .min(10, "Please share a little more detail in your review")
    .max(1200, "Review is too long"),
  images: z.array(z.string().trim().min(1)).max(4, "You can upload up to 4 images").default([]),
});

function parseBooleanValue(value: FormDataEntryValue | null) {
  return value === "true" || value === "on" || value === "1";
}

export function parseProductFormData(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: Number.parseFloat(String(formData.get("price") ?? "")),
    compareAtPrice:
      formData.get("compareAtPrice") && String(formData.get("compareAtPrice")).trim() !== ""
        ? Number.parseFloat(String(formData.get("compareAtPrice")))
        : null,
    costPrice: Number.parseFloat(String(formData.get("costPrice") ?? "0")),
    image: formData.get("image"),
    category: formData.get("category"),
    categorySlug: formData.get("categorySlug"),
    stock: Number.parseInt(String(formData.get("stock") ?? ""), 10),
    isFeatured: parseBooleanValue(formData.get("isFeatured")),
    isTrending: parseBooleanValue(formData.get("isTrending")),
    isHot: parseBooleanValue(formData.get("isHot")),
    isLimited: parseBooleanValue(formData.get("isLimited")),
  });
}

export function parseProductJson(body: unknown) {
  return productSchema.safeParse(body);
}
