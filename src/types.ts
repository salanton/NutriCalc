export type GrowthStage = 'germination' | 'vegetative' | 'pre-flowering' | 'flowering-start' | 'flower-dev' | 'ripening' | 'flushing'
export type GrowMethod = 'soil' | 'hydroponic' | 'coco'

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
}

export interface Brand {
  name: string
  code: string
} 