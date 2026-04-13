export function formatCurrency(
  amount: number,
  currency = "EUR",
  locale = "fr-FR",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}
