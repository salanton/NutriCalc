export const GROW_METHODS = {
  SOIL: 'soil',
  HYDROPONIC: 'hydroponic',
  COCO: 'coco'
} as const

export const GROW_METHOD_LABELS = {
  [GROW_METHODS.SOIL]: 'Soil',
  [GROW_METHODS.HYDROPONIC]: 'Hydroponic',
  [GROW_METHODS.COCO]: 'Coco'
} as const

export const GROW_METHOD_LABELS_RU = {
  [GROW_METHODS.SOIL]: 'Почва',
  [GROW_METHODS.HYDROPONIC]: 'Гидропоника',
  [GROW_METHODS.COCO]: 'Кокос'
}

export const GROW_METHOD_DESCRIPTIONS = {
  [GROW_METHODS.SOIL]: 'Traditional soil-based growing method',
  [GROW_METHODS.HYDROPONIC]: 'Water-based growing method without soil',
  [GROW_METHODS.COCO]: 'Coconut coir-based growing method'
} as const

export const GROW_METHOD_DESCRIPTIONS_RU = {
  [GROW_METHODS.SOIL]: 'Традиционный метод выращивания в почве',
  [GROW_METHODS.HYDROPONIC]: 'Метод выращивания на водной основе без почвы',
  [GROW_METHODS.COCO]: 'Метод выращивания на основе кокосового субстрата'
} as const 