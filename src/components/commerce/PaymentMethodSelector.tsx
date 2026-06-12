"use client";

import type { PaymentMethodId, PaymentMethodOption } from "@/lib/payment/payment-types";

type PaymentMethodSelectorProps = {
  methods: PaymentMethodOption[];
  value: PaymentMethodId;
  onChange: (value: PaymentMethodId) => void;
};

export default function PaymentMethodSelector({
  methods,
  value,
  onChange,
}: PaymentMethodSelectorProps) {
  return (
    <div className="grid gap-3">
      {methods.map((method) => {
        const disabled = method.availability !== "enabled";

        return (
          <label
            key={method.id}
            className={`rounded-[22px] border p-4 transition ${
              value === method.id
                ? "border-[#FF6A00] bg-[#FF6A00]/10"
                : "border-[var(--border)] bg-[var(--surface)]"
            } ${disabled ? "opacity-65" : "cursor-pointer"}`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={value === method.id}
                onChange={() => onChange(method.id)}
                disabled={disabled}
                className="mt-1"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{method.label}</span>
                  {method.availability !== "enabled" ? (
                    <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                      Coming soon
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                  {method.description}
                </p>
                {method.providerLabel ? (
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                    {method.providerLabel}
                  </p>
                ) : null}
              </div>
            </div>
          </label>
        );
      })}
      <p className="text-xs leading-5 text-[var(--text-secondary)]">
        Gateway buttons are disabled until real provider credentials and callback verification are added.
      </p>
    </div>
  );
}
