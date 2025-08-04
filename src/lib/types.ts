export interface NutrientBrand {
  id: string
  name: string
  code: string
  description?: string
  description_ru?: string
}

export interface Nutrient {
  name: string
  perLiter: string
}

export interface ECPh {
  ec: string
  ph: string
}

export interface Additive {
  id: string
  name: string
  defaultDose: string
  description: string
  description_ru?: string
  application?: 'foliar' | 'root' | string
  foliarDose?: string
  stages: {
    germination: string
    vegetative: string
    'pre-flowering': string
    'flowering-start': string
    'flower-dev': string
    ripening: string
    flushing: string
  }
}

export interface Brand {
  id: string
  name: string
  code: string
  description: string
  description_ru?: string
  nutrients: Record<GrowMethod, Record<GrowthStage, Nutrient[]>>
  ecPh: Record<GrowMethod, Record<GrowthStage, ECPh>>
  additives: Additive[]
}

export interface ECPhRecommendation {
  min: number
  max: number
  unit: string
}

export type GrowthStage = 'germination' | 'vegetative' | 'pre-flowering' | 'flowering-start' | 'flower-dev' | 'ripening' | 'flushing'
export type GrowMethod = 'soil' | 'hydroponic' | 'coco' 