// Formatting helpers. Cashboard defaults to EUR (it's aimed at EU/UK open
// banking first), but everything takes a currency code so it's not hard-wired.

const DEFAULT_CURRENCY = "EUR";
const LOCALE = "en-IE";

export function formatCurrency(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  decimals = 0,
): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/** Currency with an explicit +/- sign, e.g. "+€1,200" / "−€42". */
export function formatSigned(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  decimals = 0,
): string {
  const sign = amount > 0 ? "+" : amount < 0 ? "−" : "";
  return sign + formatCurrency(Math.abs(amount), currency, decimals);
}

export function formatPercent(fraction: number, decimals = 1): string {
  const sign = fraction > 0 ? "+" : fraction < 0 ? "−" : "";
  return `${sign}${Math.abs(fraction * 100).toFixed(decimals)}%`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatMonth(iso: string): string {
  return new Date(iso).toLocaleDateString(LOCALE, {
    month: "short",
    year: "2-digit",
  });
}
