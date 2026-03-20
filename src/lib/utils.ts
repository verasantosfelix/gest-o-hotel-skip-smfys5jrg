import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges multiple class names into a single string
 * @param inputs - Array of class names
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a numeric value into a currency string
 * @param value - Numeric amount
 * @param currency - Currency code (AOA, EUR, USD)
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency: string = 'AOA') {
  if (currency === 'AOA') {
    return `${value.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz`
  }
  if (currency === 'EUR') {
    return `${value.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
  }
  if (currency === 'USD') {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `${value.toFixed(2)} ${currency}`
}
