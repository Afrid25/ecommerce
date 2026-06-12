const steps = [
  "Customer information",
  "Delivery address",
  "Payment method",
  "Review order",
];

type CheckoutStepsProps = {
  activeStep?: number;
};

export default function CheckoutSteps({ activeStep = 4 }: CheckoutStepsProps) {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber <= activeStep;

        return (
          <li
            key={step}
            className={`rounded-[18px] border px-4 py-3 ${
              isActive
                ? "border-[#FF6A00] bg-[#FF6A00]/10"
                : "border-[var(--border)] bg-[var(--surface)]"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
              Step {stepNumber}
            </p>
            <p className="mt-1 text-sm font-semibold">{step}</p>
          </li>
        );
      })}
    </ol>
  );
}
