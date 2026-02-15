export function formatNumber(value: number, decimals = 2): string {
  if (value === 0) return '0';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatCurrency(value: number, decimals = 0): string {
  const prefix = value < 0 ? '-$' : '$';
  return prefix + formatNumber(Math.abs(value), decimals);
}

export function formatPercent(value: number, decimals = 2): string {
  return (value * 100).toFixed(decimals) + '%';
}
