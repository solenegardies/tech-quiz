export function formatNumber(value: number, locale = "fr-FR"): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatPercent(value: number, locale = "fr-FR"): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}
