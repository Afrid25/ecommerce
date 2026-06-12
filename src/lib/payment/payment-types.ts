export type PaymentMethodId =
  | "cod"
  | "sslcommerz"
  | "stripe"
  | "mobile_banking"
  | "bkash"
  | "nagad";

export type PaymentMethodAvailability = "enabled" | "coming-soon" | "disabled";

export type PaymentMethodOption = {
  id: PaymentMethodId;
  label: string;
  description: string;
  availability: PaymentMethodAvailability;
  providerLabel?: string;
};

export type PaymentIntentPlaceholder = {
  provider: Exclude<PaymentMethodId, "cod">;
  amount: number;
  currency: "BDT" | "USD";
  orderReference?: string;
};
