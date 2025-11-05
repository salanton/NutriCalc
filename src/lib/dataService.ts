import type { GrowthStage, GrowMethod, Nutrient, Additive, ECPh, Brand } from '@/lib/types'

// Dynamic brand loading - each brand has its own file in /data/brands/
const brandModules = import.meta.glob('@/data/brands/*.json', { eager: true })

const brands: Record<string, Brand> = Object.fromEntries(
  Object.entries(brandModules).map(([path, module]) => {
    const fileName = path.split('/').pop()?.replace('.json', '') || ''
    return [fileName, module as unknown as Brand]
  })
)

export const dataService = {
  getBrands(): Brand[] {
    return Object.values(brands)
  },

  getEnabledBrands(): Set<string> {
    try {
      const brandsVisibility = localStorage.getItem('nutricalc-brands-visibility')
      if (brandsVisibility) {
        const data = JSON.parse(brandsVisibility)
        if (data.enabledBrands) {
          return new Set(data.enabledBrands)
        }
      }
      // По умолчанию все производители включены
      return new Set(Object.values(brands).map(b => b.code))
    } catch (error) {
      console.warn('Failed to load enabled brands:', error)
      return new Set(Object.values(brands).map(b => b.code))
    }
  },

  getVisibleBrands(): Brand[] {
    const enabledBrands = this.getEnabledBrands()
    return Object.values(brands).filter(brand => enabledBrands.has(brand.code))
  },

  getBrand(code: string): Brand | undefined {
    return brands[code]
  },

  getNutrients(brandCode: string, stage: GrowthStage, growMethod: GrowMethod): Nutrient[] {
    const brandData = brands[brandCode]
    return brandData?.nutrients[growMethod]?.[stage] || []
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