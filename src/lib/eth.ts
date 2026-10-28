import Decimal from 'decimal.js'

export function formatEth(value: string): string {
  const amount = new Decimal(value)
  return amount.decimalPlaces() < 2 ? amount.toFixed(2) : amount.toString()
}
