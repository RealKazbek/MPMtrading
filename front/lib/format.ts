export function formatCurrency(value: number) {
  return value.toLocaleString('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })
}

export function formatCurrencyCompact(value: number) {
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    maximumFractionDigits: 2,
    notation: 'compact',
    style: 'currency',
  }).format(value)
}

export function formatPercent(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

export function formatPnL(value: number) {
  const sign = value >= 0 ? '+' : '-'
  return `${sign}$${Math.abs(value).toFixed(2)}`
}

export function inferPricePrecision(value: number) {
  const absoluteValue = Math.abs(value)

  if (absoluteValue >= 100) return 2
  if (absoluteValue >= 10) return 3
  return 5
}

export function formatPrice(value: number, precision?: number) {
  return value.toFixed(precision ?? inferPricePrecision(value))
}

export function formatTradeDate(iso: string) {
  const date = new Date(iso)

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  }).format(date)
}
