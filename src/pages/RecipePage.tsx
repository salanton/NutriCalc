import { Calculator } from "lucide-react"
import { SectionCard } from "@/components/section-card"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useCalculatorWithSettings } from '@/hooks/useCalculatorWithSettings'
import { dataService } from '@/lib/dataService'
import {
  GROWTH_STAGE_LABELS_RU, GROWTH_STAGE_LABELS
} from '@/constants/growth-stages'
import { 
  GROW_METHOD_LABELS_RU
} from '@/constants/grow-methods'
import { BottomNavigation } from "@/components/bottom-navigation"

export default function RecipePage() {
  const {
    waterVolume,
    results,
    growMethod,
    growthStage,
    selectedAdditives,
    nutrientBrand,
    selectedNutrientBrands,
    selectedBaseNutrients,
    basePh,
    baseEc,
    baseTemperature,
    isRussian,
    hideDescriptions,
    isProMode,
    showAverageValues,
  } = useCalculatorWithSettings()

  const unit = isRussian ? 'мл' : 'ml'

  const nutrientDisplayItems = results.nutrients.map((nutrient, index) => {
    // Check if it's a range
    if (nutrient.perLiter.includes('-')) {
      const [minStr, maxStr] = nutrient.perLiter.replace(/(ml|мл)\/?[лl]?/gi, '').split('-').map(v => v.trim())
      const min = parseFloat(minStr)
      const max = parseFloat(maxStr)
      
      // Check if the value is zero
      const isZero = min === 0 && max === 0;
      
      // In normal mode, don't show zero values
      if (!isProMode && isZero) {
        return null;
      }
      
      let perLiter, total
      if (showAverageValues) {
        // Show average value (when range toggle is ON)
        const avg = ((min + max) / 2).toFixed(1)
        perLiter = `${avg}${unit}/л`
        total = `${(parseFloat(avg) * waterVolume).toFixed(1)}${unit}`
      } else {
        // Show range (when range toggle is OFF)
        perLiter = `${min}-${max}${unit}/л`
        const minTotal = (min * waterVolume).toFixed(1)
        const maxTotal = (max * waterVolume).toFixed(1)
        total = `${minTotal}-${maxTotal}${unit}`
      }
      
      return (
        <div key={index} className={`grid grid-cols-3 gap-2 rounded-md border p-2 text-center ${isZero ? 'opacity-60 line-through' : ''}`}>
          <span className="text-sm font-medium">{nutrient.name}</span>
          <span className="data-description">{isZero ? '-' : perLiter}</span>
          <span className="data-description">{isZero ? '-' : total}</span>
        </div>
      )
    } else {
      // Single value
      const value = parseFloat(nutrient.perLiter.replace(/(ml|мл)\/?[лl]?/gi, '').trim())
      const isZero = value === 0;
      
      // In normal mode, don't show zero values
      if (!isProMode && isZero) {
        return null;
      }
      
      return (
        <div key={index} className={`grid grid-cols-3 gap-2 rounded-md border p-2 text-center ${isZero ? 'opacity-60 line-through' : ''}`}>
          <span className="text-sm font-medium">{nutrient.name}</span>
          <span className="data-description">{isZero ? '-' : nutrient.perLiter}</span>
          <span className="data-description">{isZero ? '-' : `${nutrient.amount}${unit}`}</span>
        </div>
      )
    }
  }).filter(item => item !== null)

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-8 pb-24 max-w-4xl" id="printable-content">
        <header className="mb-8">
          <div className="pl-4">
            <h1 className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent text-left">
              {isRussian ? 'Рецепт' : 'Recipe'}
            </h1>
            {!hideDescriptions && (
              <p className="text-muted-foreground text-left">{isRussian ? 'Результаты расчета питательных веществ' : 'Nutrient calculation results'}</p>
            )}
          </div>
        </header>

        <div className="space-y-6">
          {/* Results */}
          {(results.nutrients.length > 0 || results.additives.length > 0) && (
            <SectionCard
              title={isRussian ? "Результаты расчета" : "Calculation Results"}
              description={isRussian ? "С учетом всех выбранных вами параметров" : "Based on all your selected parameters"}
              icon={Calculator}
              iconColor="text-blue-500"
              hideDescriptions={hideDescriptions}
            >
              {/* Show message if in Pro Mode and no base nutrients selected */}
              {isProMode && selectedNutrientBrands.length > 0 && selectedBaseNutrients.length === 0 && results.nutrients.length === 0 && (
                <div className="mb-4 p-4 rounded-md border border-orange-300 bg-orange-50 dark:bg-orange-950 text-center">
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    {isRussian 
                      ? "Необходимо выбрать базовые удобрения или добавки"
                      : "Please select base nutrients or additives"
                    }
                  </p>
                </div>
              )}
              <div className="space-y-4">
                {/* Блок с четырьмя колонками (Метод/Этап и Бренд/Добавки) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="rounded-md border p-4 bg-accent/50 min-h-[96px]">
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-stretch h-full">
                      <div className="flex flex-col justify-center items-center h-full text-center">
                        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{isRussian ? 'Метод' : 'Method'}</h4>
                        <span className="text-lg font-bold">{isRussian ? (growMethod ? GROW_METHOD_LABELS_RU[growMethod] : '') : growMethod}</span>
                      </div>
                      <div className="border-r h-full" />
                      <div className="flex flex-col justify-center items-center h-full text-center">
                        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center w-full">{isRussian ? 'Этап' : 'Stage'}</h4>
                        <span className="text-lg font-bold text-center w-full">{isRussian ? GROWTH_STAGE_LABELS_RU[growthStage] : GROWTH_STAGE_LABELS[growthStage]}</span>
                      </div>
                    </div>
                  </div>
                  {/* Бренд / Добавки */}
                  <div className="rounded-md border p-4 bg-accent/50 min-h-[96px]">
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-stretch h-full">
                      <div className="flex flex-col justify-center items-center h-full text-center">
                        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{isRussian ? 'База' : 'Base'}</h4>
                        <span className="text-lg font-bold">
                          {isProMode 
                            ? selectedNutrientBrands.map(code => dataService.getVisibleBrands().find(b => b.code === code)?.name).filter(Boolean).join(', ') || ''
                            : dataService.getVisibleBrands().find(b => b.code === nutrientBrand)?.name || ''
                          }
                        </span>
                      </div>
                      <div className="border-r h-full" />
                      <div className="flex flex-col justify-center items-center h-full text-center">
                        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center w-full">{isRussian ? 'Добавки' : 'Additives'}</h4>
                        <span className="text-xs text-muted-foreground text-center w-full -mt-1 mb-1">
                          {isRussian 
                            ? (isProMode ? 'выбрано' : 'учтено') 
                            : (isProMode ? 'selected' : 'counted')
                          }
                        </span>
                        <span className="text-lg font-bold text-center w-full">
                          {isProMode 
                            ? `${selectedAdditives.length}x` 
                            : `${results.additives.filter(a => !a.isZero).length}x`
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Блок с базовыми параметрами воды (только в про режиме) */}
                {isProMode && (
                  <div className="rounded-md border p-4 bg-accent/50 mb-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex flex-col justify-center items-center text-center">
                        <h4 className="mb-2 text-sm font-semibold">{isRussian ? 'Базовый pH' : 'Base pH'}</h4>
                        <p className="text-lg font-bold border-b-2 border-amber-500 pb-1">{basePh}</p>
                      </div>
                      <div className="flex flex-col justify-center items-center text-center">
                        <h4 className="mb-2 text-sm font-semibold">{isRussian ? 'Базовый EC' : 'Base EC'}</h4>
                        <p className="text-lg font-bold border-b-2 border-blue-500 pb-1">{baseEc} mS/cm</p>
                      </div>
                      <div className="flex flex-col justify-center items-center text-center">
                        <h4 className="mb-2 text-sm font-semibold">{isRussian ? 'Температура' : 'Temperature'}</h4>
                        <p className="text-lg font-bold border-b-2 border-red-500 pb-1">{baseTemperature}°C</p>
                      </div>
                    </div>
                  </div>
                )}
                {/* Блок с диапазонами EC/PH и объемом воды */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {/* Блок с диапазонами EC/PH */}
                  {results.recommendations && (
                    <div className="rounded-md border p-4 bg-accent/50">
                      <div className="grid grid-cols-[1fr_auto_1fr] gap-4">
                        <div className="flex flex-col justify-center items-center">
                          <h4 className="mb-2">{isRussian ? (showAverageValues ? 'Целевой EC' : 'Диапазон EC') : (showAverageValues ? 'Target EC' : 'EC Range')}</h4>
                          <p className="text-lg font-bold border-b-2 border-blue-500 pb-1">
                            {showAverageValues 
                              ? (() => {
                                  const range = results.recommendations.ec.replace(/[^0-9.-]/g, ' ').trim().split('-').map(v => parseFloat(v.trim()));
                                  const avg = range.length === 2 ? ((range[0] + range[1]) / 2).toFixed(1) : results.recommendations.ec;
                                  return `${avg}`;
                                })()
                              : results.recommendations.ec 
                            }
                          </p>
                        </div>
                        <div className="border-r" />
                        <div className="flex flex-col justify-center items-center">
                          <h4 className="mb-2">{isRussian ? (showAverageValues ? 'Целевой pH' : 'Диапазон pH') : (showAverageValues ? 'Target pH' : 'pH Range')}</h4>
                          <p className="text-lg font-bold border-b-2 border-amber-500 pb-1">
                            {showAverageValues 
                              ? (() => {
                                  const range = results.recommendations.ph.replace(/[^0-9.-]/g, ' ').trim().split('-').map(v => parseFloat(v.trim()));
                                  const avg = range.length === 2 ? ((range[0] + range[1]) / 2).toFixed(1) : results.recommendations.ph;
                                  return `${avg}`;
                                })()
                              : results.recommendations.ph 
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Блок с объемом воды и расчетом */}
                  {(() => {
                    // Получаем данные полива из localStorage
                    let wateringData: any = null
                    try {
                      const saved = localStorage.getItem('nutricalc-watering')
                      if (saved) {
                        wateringData = JSON.parse(saved)
                      }
                    } catch (e) {
                      // Игнорируем ошибки парсинга
                    }

                    // Функция расчета даты, до которой хватит воды
                    const calculateDaysUntilWaterRunsOut = () => {
                      if (!wateringData) return null

                      const method = wateringData.wateringMethod || 'manual'
                      
                      if (method === 'drip') {
                        // Для капельного полива: объем воды / (расход в минуту * длительность * поливов в день)
                        const waterPerMinute = wateringData.compensatedDrippers 
                          ? ((wateringData.dripperValue || 4) / 60) * (wateringData.dripperCount || 4)
                          : (wateringData.waterPerMinute || 2.0)
                        const duration = wateringData.wateringDuration || 1.0
                        const wateringsPerDay = wateringData.wateringsPerDay || 1
                        const dailyConsumption = waterPerMinute * duration * wateringsPerDay
                        
                        if (dailyConsumption <= 0) return null
                        const days = Math.floor(waterVolume / dailyConsumption)
                        return days
                      } else if (method === 'hydroponic') {
                        // Для гидропоники: показываем следующую дату замены раствора
                        const frequency = wateringData.solutionChangeFrequency || 7
                        const today = new Date()
                        today.setDate(today.getDate() + frequency)
                        return today
                      } else if (method === 'manual') {
                        // Для ручного полива: показываем следующую дату полива
                        const frequency = wateringData.manualWateringFrequency || 3
                        const today = new Date()
                        today.setDate(today.getDate() + frequency)
                        return today
                      }
                      return null
                    }

                    const daysOrDate = calculateDaysUntilWaterRunsOut()
                    const method = wateringData?.wateringMethod || 'manual'
                    const showSecondColumn = method === 'drip' // Показываем вторую колонку только для капельного полива

                    return (
                      <div className="rounded-md border p-4 bg-accent/50 min-h-[96px]">
                        <div className={`grid ${showSecondColumn ? 'grid-cols-[1fr_auto_1fr]' : 'grid-cols-1'} gap-4 items-stretch h-full`}>
                          <div className="flex flex-col justify-center items-center h-full text-center">
                            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              {isRussian ? 'Заданный объем' : 'Set Volume'}
                            </h4>
                            <span className="text-lg font-bold">{waterVolume}л</span>
                          </div>
                          {showSecondColumn && (
                            <>
                              <div className="border-r h-full" />
                              <div className="flex flex-col justify-center items-center h-full text-center">
                                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center w-full">
                                  {isRussian ? 'Хватит на' : 'Will last'}
                                </h4>
                                <span className="text-lg font-bold text-center w-full">
                                  {daysOrDate !== null 
                                    ? `${daysOrDate} ${isRussian ? 'дн.' : 'days'}`
                                    : '-'
                                  }
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* Base Nutrients - only show if manufacturer is selected and nutrients exist */}
                {results.nutrients.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold">Базовые удобрения</h4>
                    <div className="grid gap-2">
                      <div className="grid grid-cols-3 gap-2 rounded-md border p-2 bg-muted/50 text-center">
                        <span className="text-sm font-semibold">Линейка</span>
                        <span className="text-sm font-semibold">На 1л</span>
                        <span className="text-sm font-semibold">На {waterVolume}л</span>
                      </div>
                      {nutrientDisplayItems}
                    </div>
                  </div>
                )}

                {/* Additives */}
                {results.additives.filter(a => a.application !== 'foliar').length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold">Добавки</h4>
                    <div className="grid gap-2">
                    <div className="grid grid-cols-3 gap-2 rounded-md border p-2 bg-muted/50 text-center">
                      <span className="text-sm font-semibold text-center">Под корень</span>
                      <span className="text-sm font-semibold text-center">На 1л</span>
                      <span className="text-sm font-semibold text-center">На {waterVolume}л</span>
                    </div>
                        {results.additives.filter(a => a.application !== 'foliar').map((add, idx) => {
                        let totalAmount = add.amountRange;
                        
                        if (add.amountRange !== '-' && add.amountRange.includes('-')) {
                          if (showAverageValues) {
                            // Show average value (when range toggle is ON)
                            const [min, max] = add.amountRange.split('-').map(v => parseFloat(v))
                            const avg = ((min + max) / 2).toFixed(1)
                            totalAmount = `${avg}${unit}`
                          } else {
                            // Show range (when range toggle is OFF)
                            totalAmount = `${add.amountRange}${unit}`
                          }
                        } else if (add.amountRange !== '-') {
                          totalAmount = `${add.amountRange}${unit}`
                        }
                        
                        // Format defaultDose with unit - apply averaging
                        let perLiterDose = add.defaultDose
                        if (add.defaultDose !== '-' && add.defaultDose.includes('-')) {
                          if (showAverageValues) {
                            // Show average value (when range toggle is ON)
                            const [min, max] = add.defaultDose.split('-').map(v => parseFloat(v.trim()))
                            const avg = ((min + max) / 2).toFixed(2)
                            perLiterDose = `${avg}${unit}`
                          } else {
                            // Show range (when range toggle is OFF)
                            perLiterDose = `${add.defaultDose}${unit}`
                          }
                        } else if (add.defaultDose !== '-') {
                          perLiterDose = `${add.defaultDose}${unit}`
                        }
                        
                        return (
                          <div key={add.id + idx} className={`grid grid-cols-3 gap-2 rounded-md border p-2 text-center ${add.isZero ? 'opacity-60 line-through' : ''}`}>
                            <span className="text-sm font-medium">{add.name}</span>
                            <span className="data-description">{perLiterDose}</span>
                            <span className="data-description">{totalAmount}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Foliar Additives */}
                {results.additives.filter(a => a.application === 'foliar').length > 0 && (
                  <div className="space-y-2">
                    <div style={{height: '1em'}} />
                    <div className="grid gap-2">
                      <div className="grid grid-cols-3 gap-2 rounded-md border p-2 bg-muted/50 text-center">
                        <span className="text-sm font-semibold text-center">По листу</span>
                        <span className="text-sm font-semibold text-center">Капли</span>
                        <span className="text-sm font-semibold text-center">На 1л</span>
                      </div>
                        {results.additives.filter(a => a.application === 'foliar').map((add, idx) => {
                        // Format dose for display - apply averaging only to "На 1л" column, not to "Капли"
                        let perLiterDose = add.defaultDose
                        if (add.defaultDose !== '-' && add.defaultDose.includes('-')) {
                          if (showAverageValues) {
                            // Show average value (when range toggle is ON)
                            const [min, max] = add.defaultDose.split('-').map(v => parseFloat(v.trim()))
                            const avg = ((min + max) / 2).toFixed(2)
                            perLiterDose = `${avg}${unit}`
                          } else {
                            // Show range (when range toggle is OFF)
                            perLiterDose = `${add.defaultDose}${unit}`
                          }
                        } else if (add.defaultDose !== '-') {
                          perLiterDose = `${add.defaultDose}${unit}`
                        }
                        
                        return (
                          <div key={add.id + idx} className={`grid grid-cols-3 gap-2 rounded-md border p-2 text-center ${add.isZero ? 'opacity-60 line-through' : ''}`}>
                            <span className="text-sm font-medium">{add.name}</span>
                            <span className="data-description">{add.foliarDose || '-'}</span>
                            <span className="data-description">{perLiterDose}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>
          )}
        </div>
      </div>
      <BottomNavigation />
    </TooltipProvider>
  )
}

