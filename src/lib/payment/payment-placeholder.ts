import type { PaymentIntentPlaceholder } from "@/lib/payment/payment-types";

export async function createPaymentIntentPlaceholder(
  intent: PaymentIntentPlaceholder
) {
  void intent;

  // TODO: Add SSLCommerz, Stripe, and mobile banking API calls here.
  // Keep credentials server-only through environment variables such as
  // SSLCOMMERZ_STORE_ID, SSLCOMMERZ_STORE_PASSWORD, and STRIPE_SECRET_KEY.
  return {
    ready: false,
    message: "Payment gateway integration is not configured yet.",
  };
}
