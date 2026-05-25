export function formatCurrency(value: number, currencyCode = "PKR"): string {
  const safe = Number.isFinite(value) ? value : 0;
  return `${currencyCode} ${safe.toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatNumber(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  return safe.toLocaleString("en-PK");
}
