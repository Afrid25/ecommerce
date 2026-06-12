import type { PaymentMethodOption } from "@/lib/payment/payment-types";

export const paymentGatewayEnabled =
  process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_ENABLED === "true";

export const paymentMethods: PaymentMethodOption[] = [
  {
    id: "cod",
    label: "Cash on Delivery",
    description: "Pay after the parcel reaches your address.",
    availability: "enabled",
    providerLabel: "Manual collection",
  },
  {
    id: "sslcommerz",
    label: "SSLCommerz",
    description: "Local cards, banks, and wallets. Integration slot is ready.",
    availability: paymentGatewayEnabled ? "coming-soon" : "disabled",
    providerLabel: "Local gateway",
  },
  {
    id: "stripe",
    label: "Stripe",
    description: "International card payments. Waiting for live credentials.",
    availability: paymentGatewayEnabled ? "coming-soon" : "disabled",
    providerLabel: "Card gateway",
  },
  {
    id: "mobile_banking",
    label: "Mobile banking",
    description: "bKash, Nagad, Rocket, and wallet flows will connect here.",
    availability: paymentGatewayEnabled ? "coming-soon" : "disabled",
    providerLabel: "Wallet gateway",
  },
];
