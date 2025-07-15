export default function calculateTotal(amounts: string): number {
  // Split by newlines or commas, remove empty strings, and convert to numbers
  const amountArray = amounts
    .split(/[\n,]+/) // Split by newline or comma
    .map((amt) => amt.trim()) // Remove whitespace
    .filter((amt) => amt.length > 0) // Remove empty strings
    .map((amt) => parseFloat(amt)) // Convert to numbers
    .filter((amt) => !isNaN(amt) && isFinite(amt)) // Remove invalid numbers and infinity values

  // Sum all numbers
  return amountArray.reduce((sum, num) => sum + num, 0)
}
