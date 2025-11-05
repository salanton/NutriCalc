import { useState, useCallback } from 'react'
import type { GrowthStage, GrowMethod } from '../lib/types'
import { dataService } from '../lib/dataService'
import { calculateNutrientAmount, calculateAdditiveAmount, calculateAdditiveAmountRange, formatAmount } from '../utils/calculations'

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

export function useNutrientCalculator() {
  const [growMethod, setGrowMethod] = useState<GrowMethod>('coco')
  const [growthStage, setGrowthStage] = useState<GrowthStage>('flower-dev')
  const [waterVolume, setWaterVolume] = useState<number>(10)
  const [basePh, setBasePh] = useState<number>(7.5)
  const [baseEc, setBaseEc] = useState<number>(0.4)
  const [baseTemperature, setBaseTemperature] = useState<number>(18)
  const [selectedAdditives, setSelectedAdditives] = useState<Array<{ id: string; brand: string }>>([])

  const calculateResults = useCallback((nutrientBrand: string, isProMode = false): CalculationResult => {
    const results: CalculationResult = {
      nutrients: [],
      additives: [],
      recommendations: undefined
    }

    // Calculate base nutrients
    const stageNutrients = dataService.getNutrients(nutrientBrand, growthStage, growMethod)
    results.nutrients = stageNutrients
      .filter(nutrient => {
        // Check if the nutrient has a non-zero value
        const value = nutrient.perLiter.replace('ml', '').trim()
        return value !== '0' && value !== '0.0' && value !== '0ml'
      })
      .map(nutrient => ({
        name: nutrient.name,
        perLiter: nutrient.perLiter,
        amount: formatAmount(calculateNutrientAmount(nutrient, waterVolume))
      }))

    // Calculate additives
    selectedAdditives.forEach(additive => {
      const additiveData = dataService.getAdditives(nutrientBrand).find(a => a.id === additive.id)
      if (additiveData) {
        const stageDose = additiveData.stages[growthStage]
        const isZero = !stageDose || /^0(\.0*)?(ml)?$/i.test(stageDose.trim())
        if (!isZero) {
          results.additives.push({
            id: additive.id,
            name: additiveData.name,
            defaultDose: additiveData.application === 'foliar'
              ? (additiveData.defaultDose || '')
              : (/ml$/i.test(stageDose) ? stageDose : stageDose + 'мл'),
            amount: formatAmount(calculateAdditiveAmount(additiveData, growthStage, waterVolume)),
            amountRange: calculateAdditiveAmountRange(additiveData, growthStage, waterVolume),
            application: additiveData.application || '',
            foliarDose: additiveData.foliarDose || '',
            stageDose: stageDose,
            isZero: false
          })
        } else if (isProMode) {
          // В про-режиме добавляем даже если дозировка 0, но с дефисами
          results.additives.push({
            id: additive.id,
            name: additiveData.name,
            defaultDose: '-',
            amount: '-',
            amountRange: '-',
            application: additiveData.application || '',
            foliarDose: additiveData.foliarDose || '',
            stageDose: '-',
            isZero: true
          })
        }
      }
    })

    // Get EC/PH recommendations
    const ecPh = dataService.getECPh(nutrientBrand, growthStage, growMethod)
    if (ecPh) {
      results.recommendations = {
        ec: ecPh.ec,
        ph: ecPh.ph
      }
    }

    return results
  }, [growMethod, growthStage, waterVolume, selectedAdditives])

  return {
    growMethod,
    setGrowMethod,
    growthStage,
    setGrowthStage,
    waterVolume,
    setWaterVolume,
    basePh,
    setBasePh,
    baseEc,
    setBaseEc,
    baseTemperature,
    setBaseTemperature,
    selectedAdditives,
    setSelectedAdditives,
    calculateResults
  }
} 