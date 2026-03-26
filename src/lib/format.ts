export function formatCurrency(amount: number) {
  const formattedAmount = new Intl.NumberFormat("en-BD", {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);

  return `Tk ${formattedAmount}`;
}
