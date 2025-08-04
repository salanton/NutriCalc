export const GROWTH_STAGES = {
  GERMINATION: 'germination',
  VEGETATIVE: 'vegetative',
  PRE_FLOWERING: 'pre-flowering',
  FLOWERING_START: 'flowering-start',
  FLOWER_DEV: 'flower-dev',
  RIPENING: 'ripening',
  FLUSHING: 'flushing'
} as const

export const GROWTH_STAGE_LABELS = {
  [GROWTH_STAGES.GERMINATION]: 'Germination & Rooting',
  [GROWTH_STAGES.VEGETATIVE]: 'Vegetative Growth',
  [GROWTH_STAGES.PRE_FLOWERING]: 'Pre-Flowering',
  [GROWTH_STAGES.FLOWERING_START]: 'Flowering Start',
  [GROWTH_STAGES.FLOWER_DEV]: 'Flower Development',
  [GROWTH_STAGES.RIPENING]: 'Ripening',
  [GROWTH_STAGES.FLUSHING]: 'Flushing'
} as const

export const GROWTH_STAGE_LABELS_RU = {
  [GROWTH_STAGES.GERMINATION]: 'Прорастание и укоренение',
  [GROWTH_STAGES.VEGETATIVE]: 'Вегетативный рост',
  [GROWTH_STAGES.PRE_FLOWERING]: 'Предцветение',
  [GROWTH_STAGES.FLOWERING_START]: 'Начало цветения',
  [GROWTH_STAGES.FLOWER_DEV]: 'Развитие цветка',
  [GROWTH_STAGES.RIPENING]: 'Созревание',
  [GROWTH_STAGES.FLUSHING]: 'Промывка'
} as const

export const GROWTH_STAGE_DESCRIPTIONS = {
  [GROWTH_STAGES.GERMINATION]: 'First pair of leaves appearing',
  [GROWTH_STAGES.VEGETATIVE]: 'Building plant green mass',
  [GROWTH_STAGES.PRE_FLOWERING]: 'Building plant green mass, beginning of inflorescence formation',
  [GROWTH_STAGES.FLOWERING_START]: 'Plant growth slowing, inflorescence development',
  [GROWTH_STAGES.FLOWER_DEV]: 'Inflorescence densification, stopping vertical plant growth',
  [GROWTH_STAGES.RIPENING]: 'Stopping inflorescence growth',
  [GROWTH_STAGES.FLUSHING]: 'Preparing for harvest'
} as const

export const GROWTH_STAGE_DESCRIPTIONS_RU = {
  [GROWTH_STAGES.GERMINATION]: 'Появление первой пары листьев',
  [GROWTH_STAGES.VEGETATIVE]: 'Набор зеленой массы растения',
  [GROWTH_STAGES.PRE_FLOWERING]: 'Набор зеленой массы, начало формирования соцветий',
  [GROWTH_STAGES.FLOWERING_START]: 'Замедление роста, развитие соцветий',
  [GROWTH_STAGES.FLOWER_DEV]: 'Уплотнение соцветий, прекращение вертикального роста',
  [GROWTH_STAGES.RIPENING]: 'Прекращение роста соцветий',
  [GROWTH_STAGES.FLUSHING]: 'Подготовка к сбору урожая'
} as const

export const GROWTH_STAGE_ICONS = {
  [GROWTH_STAGES.GERMINATION]: '🌱',
  [GROWTH_STAGES.VEGETATIVE]: '🌿',
  [GROWTH_STAGES.PRE_FLOWERING]: '🌺',
  [GROWTH_STAGES.FLOWERING_START]: '🌺',
  [GROWTH_STAGES.FLOWER_DEV]: '🌸',
  [GROWTH_STAGES.RIPENING]: '🌻',
  [GROWTH_STAGES.FLUSHING]: '💧'
} as const 