import type { Nutrient, Additive } from '../lib/types'

export function calculateNutrientAmount(nutrient: Nutrient, waterVolume: number): number {
  // Extract the numeric part and unit from perLiter string
  const perLiterStr = nutrient.perLiter

  
  // Handle ranges (e.g., "0.5-2.0ml")
  if (perLiterStr.includes('-')) {
    const [min, max] = perLiterStr.split('-').map(v => parseFloat(v))
    // Use the average of the range
    const avgPerLiter = (min + max) / 2
    return avgPerLiter * waterVolume
  }
  
  // Handle single values (e.g., "2.0ml")
  const perLiter = parseFloat(perLiterStr)
  return perLiter * waterVolume
}

export function calculateAdditiveAmount(additive: Additive, stage: string, waterVolume: number): number {
  const stageDose = additive.stages[stage as keyof typeof additive.stages] || '0'
  
  // Handle ranges (e.g., "0.5-2.0")
  if (stageDose.includes('-')) {
    const [min, max] = stageDose.split('-').map(v => parseFloat(v))
    // Use the average of the range
    const avgDose = (min + max) / 2
    return avgDose * waterVolume
  }
  
  // Handle single values (e.g., "2.0")
  const dose = parseFloat(stageDose)
  return dose * waterVolume
}

export function formatAmount(amount: number): string {
  return amount.toFixed(2)
}

export function validateEC(ec: number, min: number, max: number): boolean {
  return ec >= min && ec <= max
}

export function validatePH(ph: number, min: number, max: number): boolean {
  return ph >= min && ph <= max
} 