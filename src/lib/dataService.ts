import simplexData from '@/data/brands/simplex.json'
import type { GrowthStage, GrowMethod, Nutrient, Additive, ECPh, Brand } from '@/lib/types'

// Type assertion to ensure JSON data matches our types
const brands: Record<string, Brand> = {
  simplex: simplexData as unknown as Brand
}

export const dataService = {
  getBrands(): Brand[] {
    return Object.values(brands)
  },

  getBrand(code: string): Brand | undefined {
    return brands[code]
  },

  getNutrients(brandCode: string, stage: GrowthStage, growMethod: GrowMethod): Nutrient[] {
    return brands[brandCode]?.nutrients[growMethod]?.[stage] || []
  },

  getECPh(brandCode: string, stage: GrowthStage, growMethod: GrowMethod): ECPh | undefined {
    return brands[brandCode]?.ecPh[growMethod]?.[stage]
  },

  getAdditives(brandCode: string): Additive[] {
    return brands[brandCode]?.additives || []
  },

  // Helper function to calculate total nutrient amount
  calculateTotal(perLiter: string, waterVolume: number): string {
    const value = parseFloat(perLiter)
    const unit = perLiter.replace(/[\d.]/g, '').trim()
    return `${(value * waterVolume).toFixed(1)}${unit}`
  }
} 