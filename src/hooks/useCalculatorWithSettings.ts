import { useMemo, useEffect } from 'react'
import { useSettings } from './useSettings'
import { dataService } from '@/lib/dataService'
import { calculateAdditiveAmount, calculateAdditiveAmountRange, formatAmount } from '@/utils/calculations'
import type { Additive, GrowMethod } from '@/lib/types'

interface CalculationResult {
  nutrients: Array<{ name: string; perLiter: string; amount: string }>
  additives: Array<{
    id: string;
    name: string;
    defaultDose: string;
    amount: string;
    amountRange: string;
    application?: string;
    foliarDose?: string;
    stageDose?: string;
    isZero?: boolean;
  }>
  recommendations?: { ec: string; ph: string }
}

export function useCalculatorWithSettings() {
  const { settings, updateSetting, updateSettings } = useSettings()

  // Очистка невидимых производителей из выбранных
  useEffect(() => {
    const checkAndCleanDisabledBrands = () => {
      const enabledBrands = dataService.getEnabledBrands()
      
      // Очищаем выбранные бренды базовых удобрений
      const filteredNutrientBrands = settings.selectedNutrientBrands.filter(code => enabledBrands.has(code))
      if (filteredNutrientBrands.length !== settings.selectedNutrientBrands.length) {
        updateSetting('selectedNutrientBrands', filteredNutrientBrands)
      }
      
      // Очищаем выбранный бренд базовых удобрений (если не в Pro Mode)
      if (settings.nutrientBrand && !enabledBrands.has(settings.nutrientBrand)) {
        updateSetting('nutrientBrand', '')
      }
      
      // Очищаем выбранные бренды добавок
      const filteredAdditiveBrands = settings.selectedAdditiveBrands.filter(code => enabledBrands.has(code))
      if (filteredAdditiveBrands.length !== settings.selectedAdditiveBrands.length) {
        updateSetting('selectedAdditiveBrands', filteredAdditiveBrands)
      }
      
      // Очищаем выбранные добавки невидимых брендов
      const filteredAdditives = settings.selectedAdditives.filter(additive => enabledBrands.has(additive.brand))
      if (filteredAdditives.length !== settings.selectedAdditives.length) {
        updateSetting('selectedAdditives', filteredAdditives)
      }
      
      // Очищаем выбранные базовые удобрения невидимых брендов
      const brandsToProcess = settings.isProMode 
        ? settings.selectedNutrientBrands 
        : (settings.nutrientBrand ? [settings.nutrientBrand] : [])
      
      // Если все бренды базовых удобрений невидимы, очищаем selectedBaseNutrients
      if (brandsToProcess.length > 0 && brandsToProcess.every(code => !enabledBrands.has(code))) {
        updateSetting('selectedBaseNutrients', [])
      }
    }

    // Проверяем сразу при монтировании
    checkAndCleanDisabledBrands()

    // Слушаем изменения в localStorage для видимости производителей
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'nutricalc-brands-visibility') {
        checkAndCleanDisabledBrands()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Также проверяем периодически (для случаев, когда изменения происходят в той же вкладке)
    const interval = setInterval(checkAndCleanDisabledBrands, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [settings.selectedNutrientBrands, settings.nutrientBrand, settings.selectedAdditiveBrands, settings.selectedAdditives, settings.selectedBaseNutrients, settings.isProMode, updateSetting])

  // Calculate results based on current settings
  const results = useMemo((): CalculationResult => {
    const results: CalculationResult = {
      nutrients: [],
      additives: [],
      recommendations: undefined
    }

    // In Pro Mode, use selectedNutrientBrands, otherwise use nutrientBrand
    const brandsToProcess = settings.isProMode 
      ? settings.selectedNutrientBrands 
      : (settings.nutrientBrand ? [settings.nutrientBrand] : [])

    // Calculate base nutrients - only if a manufacturer is selected AND growMethod is set
    if (brandsToProcess.length > 0 && settings.growMethod) {
      // Collect nutrients from all selected brands
      const allNutrients: Array<{ name: string; perLiter: string; amount: string }> = []
      
      brandsToProcess.forEach(brandCode => {
        const stageNutrients = dataService.getNutrients(brandCode, settings.growthStage, settings.growMethod as GrowMethod)
        
        stageNutrients.forEach(nutrient => {
          allNutrients.push({
            name: nutrient.name,
            perLiter: nutrient.perLiter,
            amount: formatAmount(calculateAdditiveAmount({
              stages: { [settings.growthStage]: nutrient.perLiter }
            } as Additive, settings.growthStage, settings.waterVolume))
          })
        })
      })
      
      results.nutrients = allNutrients
    }

    // Calculate additives - look in the additive's own brand
    settings.selectedAdditives.forEach(additive => {
      // Use the brand of the additive itself, not the nutrient brands
      const additiveData = dataService.getAdditives(additive.brand).find(a => a.id === additive.id)
      
      if (additiveData) {
        const stageDose = additiveData.stages[settings.growthStage]
        const isZero = !stageDose || /^0(\.0*)?(ml)?$/i.test(stageDose.trim())
        if (!isZero || settings.isProMode) {
          // Format dose for display
          let defaultDose = '-'
          if (!isZero) {
            if (additiveData.application === 'foliar') {
              defaultDose = additiveData.defaultDose || ''
            } else {
              // For root additives, show range or average based on setting
              if (stageDose.includes('-')) {
                if (settings.showAverageValues) {
                  // Show average value (when range toggle is ON)
                  const [min, max] = stageDose.split('-').map(v => parseFloat(v.trim()))
                  const avg = ((min + max) / 2).toFixed(2)
                  defaultDose = avg
                } else {
                  // Show range (when range toggle is OFF)
                  defaultDose = stageDose
                }
              } else {
                defaultDose = stageDose
              }
            }
          }
          
          results.additives.push({
            id: additive.id,
            name: additiveData.name,
            defaultDose: defaultDose,
            amount: formatAmount(calculateAdditiveAmount(additiveData, settings.growthStage, settings.waterVolume)),
            amountRange: isZero ? '-' : calculateAdditiveAmountRange(additiveData, settings.growthStage, settings.waterVolume),
            application: additiveData.application || '',
            foliarDose: additiveData.foliarDose || '',
            stageDose: stageDose,
            isZero: isZero
          })
        }
      }
    })

    // Get EC/PH recommendations from the first selected brand (only if we have nutrients)
    if (brandsToProcess.length > 0 && settings.growMethod) {
      const firstBrand = brandsToProcess[0]
      const ecPh = dataService.getECPh(firstBrand, settings.growthStage, settings.growMethod as GrowMethod)
      if (ecPh) {
        results.recommendations = {
          ec: ecPh.ec,
          ph: ecPh.ph
        }
      }
    }

    return results
  }, [settings])

  // Helper functions to update specific settings
  const setGrowMethod = (growMethod: typeof settings.growMethod) => {
    updateSetting('growMethod', growMethod)
  }

  const toggleGrowMethod = (growMethod: typeof settings.growMethod) => {
    if (settings.growMethod === growMethod) {
      // If already selected, toggle it off
      updateSetting('growMethod', '')
    } else {
      updateSetting('growMethod', growMethod as GrowMethod)
    }
  }

  const setGrowthStage = (growthStage: typeof settings.growthStage) => {
    updateSetting('growthStage', growthStage)
  }

  const setNutrientBrand = (nutrientBrand: string) => {
    updateSetting('nutrientBrand', nutrientBrand)
  }

  const setSelectedNutrientBrands = (selectedNutrientBrands: typeof settings.selectedNutrientBrands) => {
    updateSetting('selectedNutrientBrands', selectedNutrientBrands)
  }

  const toggleNutrientBrand = (brandCode: string) => {
    const isSelected = settings.selectedNutrientBrands.includes(brandCode)
    if (isSelected) {
      setSelectedNutrientBrands(settings.selectedNutrientBrands.filter(code => code !== brandCode))
    } else {
      setSelectedNutrientBrands([...settings.selectedNutrientBrands, brandCode])
    }
  }

  const isNutrientBrandSelected = (brandCode: string) => {
    return settings.selectedNutrientBrands.includes(brandCode)
  }

  const setWaterVolume = (waterVolume: number) => {
    updateSetting('waterVolume', waterVolume)
  }

  const setBasePh = (basePh: number) => {
    updateSetting('basePh', basePh)
  }

  const setBaseEc = (baseEc: number) => {
    updateSetting('baseEc', baseEc)
  }

  const setBaseTemperature = (baseTemperature: number) => {
    updateSetting('baseTemperature', baseTemperature)
  }

  const setSelectedAdditives = (selectedAdditives: typeof settings.selectedAdditives) => {
    updateSetting('selectedAdditives', selectedAdditives)
  }

  const setSelectedAdditiveBrands = (selectedAdditiveBrands: typeof settings.selectedAdditiveBrands) => {
    updateSetting('selectedAdditiveBrands', selectedAdditiveBrands)
  }

  const setHideDescriptions = (hideDescriptions: boolean) => {
    updateSetting('hideDescriptions', hideDescriptions)
  }

  const setIsProMode = (isProMode: boolean) => {
    updateSetting('isProMode', isProMode)
  }

  const setLanguage = (language: 'ru' | 'en' | 'fr') => {
    updateSetting('language', language)
  }

  // Для обратной совместимости
  const isRussian = settings.language === 'ru'

  const setShowAverageValues = (showAverageValues: boolean) => {
    updateSetting('showAverageValues', showAverageValues)
  }

  const setOnlyRecommended = (onlyRecommended: boolean) => {
    updateSetting('onlyRecommended', onlyRecommended)
  }

  const toggleAdditive = (id: string, brand: string) => {
    const isSelected = settings.selectedAdditives.some((a) => a.id === id && a.brand === brand)
    if (isSelected) {
      setSelectedAdditives(settings.selectedAdditives.filter((a) => !(a.id === id && a.brand === brand)))
    } else {
      setSelectedAdditives([...settings.selectedAdditives, { id, brand }])
    }
  }

  const isAdditiveSelected = (id: string, brand: string) => {
    return settings.selectedAdditives.some((a) => a.id === id && a.brand === brand)
  }

  const toggleAdditiveBrand = (brandCode: string) => {
    const isSelected = settings.selectedAdditiveBrands.includes(brandCode)
    if (isSelected) {
      setSelectedAdditiveBrands(settings.selectedAdditiveBrands.filter(code => code !== brandCode))
    } else {
      setSelectedAdditiveBrands([...settings.selectedAdditiveBrands, brandCode])
    }
  }

  const resetAdditives = () => {
    setSelectedAdditiveBrands([])
    setSelectedAdditives([])
    setSelectedBaseNutrients([])
    setNutrientBrand('')
    setSelectedNutrientBrands([])
  }

  const setSelectedBaseNutrients = (selectedBaseNutrients: typeof settings.selectedBaseNutrients) => {
    updateSetting('selectedBaseNutrients', selectedBaseNutrients)
  }

  const toggleBaseNutrient = (name: string, growMethod: string) => {
    const isSelected = settings.selectedBaseNutrients.some((n) => n.name === name && n.growMethod === growMethod)
    if (isSelected) {
      setSelectedBaseNutrients(settings.selectedBaseNutrients.filter((n) => !(n.name === name && n.growMethod === growMethod)))
    } else {
      setSelectedBaseNutrients([...settings.selectedBaseNutrients, { name, growMethod }])
    }
  }

  const isBaseNutrientSelected = (name: string, growMethod: string) => {
    return settings.selectedBaseNutrients.some((n) => n.name === name && n.growMethod === growMethod)
  }

  return {
    // Settings
    ...settings,
    
    // Expose selectedNutrientBrands for display purposes
    selectedNutrientBrands: settings.selectedNutrientBrands,

    // Results
    results,

    // Update functions
    updateSetting,
    updateSettings,

    // Specific setters
    setGrowMethod,
    toggleGrowMethod,
    setGrowthStage,
    setNutrientBrand,
    setWaterVolume,
    setBasePh,
    setBaseEc,
    setBaseTemperature,
    setSelectedAdditives,
    setSelectedAdditiveBrands,
    setHideDescriptions,
    setIsProMode,
    setLanguage,
    isRussian,
    setShowAverageValues,
    setOnlyRecommended,

    // Helper functions
    toggleAdditive,
    isAdditiveSelected,
    toggleAdditiveBrand,
    resetAdditives,
    setSelectedBaseNutrients,
    toggleBaseNutrient,
    isBaseNutrientSelected,
    setSelectedNutrientBrands,
    toggleNutrientBrand,
    isNutrientBrandSelected,
  }
}
