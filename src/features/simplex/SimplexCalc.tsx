"use client"

import { useState, useEffect, useMemo } from "react"
import { Leaf, SproutIcon as Seedling, Sun, Droplet, Copy, FileDown, Gem, Citrus, TreePine, Droplets, Moon, Flower, SprayCan, RotateCcw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ThemeToggle } from "@/components/theme-toggle"
import { SettingsToggle } from "@/components/settings-toggle"
import { dataService } from '@/lib/dataService'
import { 
  GROWTH_STAGES, GROWTH_STAGE_LABELS, GROWTH_STAGE_DESCRIPTIONS,
  GROWTH_STAGE_LABELS_RU, GROWTH_STAGE_DESCRIPTIONS_RU 
} from '@/constants/growth-stages'
import { 
  GROW_METHODS, GROW_METHOD_LABELS, GROW_METHOD_DESCRIPTIONS,
  GROW_METHOD_LABELS_RU, GROW_METHOD_DESCRIPTIONS_RU
} from '@/constants/grow-methods'
import { useNutrientCalculator } from '@/hooks/useNutrientCalculator'
import type { Additive } from '@/lib/types'
import { Slider } from "@/components/ui/slider"
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface SimplexCalcProps {
  className?: string
  showThemeToggle?: boolean
  onCalculate?: (results: any) => void
}



export default function SimplexCalc({ className = "", showThemeToggle = true }: SimplexCalcProps) {
  const brands = dataService.getBrands();
  const [nutrientBrand, setNutrientBrand] = useState<string>(brands[0]?.code || "simplex");

  const {
    growMethod,
    setGrowMethod,
    growthStage,
    setGrowthStage,
    waterVolume,
    setWaterVolume,
    selectedAdditives,
    setSelectedAdditives,
    calculateResults,
    basePh,
    setBasePh,
    baseEc,
    setBaseEc,
    baseTemperature,
    setBaseTemperature
  } = useNutrientCalculator()


  const [hideDescriptions, setHideDescriptions] = useState<boolean>(false)
  const [isProMode, setIsProMode] = useState<boolean>(false)
  const [isRussian, setIsRussian] = useState<boolean>(true)
  const [showAverageValues, setShowAverageValues] = useState<boolean>(true)

  // When Pro mode is enabled, automatically enable hideDescriptions (but allow user to change it)
  useEffect(() => {
    if (isProMode) {
      setHideDescriptions(true)
    }
    // Do not auto-disable hideDescriptions when Pro is turned off
    // eslint-disable-next-line
  }, [isProMode])

  // Memoize the calculation results to prevent unnecessary recalculations
  const results = useMemo(() => calculateResults(nutrientBrand, isProMode), [
    nutrientBrand,
    growMethod,
    growthStage,
    waterVolume,
    selectedAdditives,
    isRussian,
    isProMode
  ])

  // Memoize the nutrient display items to prevent unnecessary re-renders
  const nutrientDisplayItems = useMemo(() => 
    results.nutrients.map((nutrient, index) => {
      const perLiterValue = nutrient.perLiter.replace(/(ml|мл)\/?[лl]?/gi, '').trim();
      const perLiter = isRussian ? `${perLiterValue}мл/л` : `${perLiterValue}ml/L`;
      const [min, max] = nutrient.perLiter.replace(/ml/gi, '').split('-').map(v => parseFloat(v.trim()));
      const minTotal = (min * waterVolume).toFixed(1);
      const maxTotal = (max * waterVolume).toFixed(1);
      return (
        <div key={index} className="grid grid-cols-3 gap-2 rounded-md border p-2 text-center">
          <span className="text-sm font-medium">{nutrient.name}</span>
          <span className="data-description">{perLiter}</span>
          <span className="data-description">{min === max ? `${minTotal}${isRussian ? 'мл' : 'ml'}` : `${minTotal}-${maxTotal}${isRussian ? 'мл' : 'ml'}`}</span>
        </div>
      )
    }), [results.nutrients, waterVolume, isRussian])

  // Update selected additives when brand changes
  useEffect(() => {
    setSelectedAdditives([])
  }, [nutrientBrand])







  const toggleAdditive = (id: string, brand: string) => {
    setSelectedAdditives((prev) => {
      const isSelected = prev.some((a) => a.id === id && a.brand === brand)
      if (isSelected) {
        return prev.filter((a) => !(a.id === id && a.brand === brand))
      } else {
        return [...prev, { id, brand }]
      }
    })
  }

  const isAdditiveSelected = (id: string, brand: string) => {
    return selectedAdditives.some((a) => a.id === id && a.brand === brand)
  }

  const handleExportPDF = () => {
    const input = document.getElementById('printable-content');
    if (input) {
      html2canvas(input, {
        scale: 2, // Увеличим масштаб для лучшего качества
        useCORS: true,
        logging: false,
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'px', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();


        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;

        let newWidth = pdfWidth - 20; // with some margin
        let newHeight = newWidth / ratio;

        // Add a title
        pdf.setFontSize(20);
        pdf.text("NutriCalc Results", 10, 15);

        pdf.addImage(imgData, 'PNG', 10, 25, newWidth, newHeight);
        pdf.save("NutriCalc_Results.pdf");
      });
    }
  };

  const handleCopyResults = () => {
    // In a real app, this would copy results to clipboard
    const results = calculateResults(nutrientBrand, isProMode)
    navigator.clipboard.writeText(JSON.stringify(results, null, 2))
      .then(() => alert("Results copied to clipboard!"))
      .catch(() => alert("Failed to copy results"))
  }



  const labels = isRussian ? {
    appTitle: 'Калькулятор питательных веществ',
    growParams: 'Метод и этап',
    growParamsDesc: 'Выберите метод выращивания и текущую стадию роста',
    growMethod: 'Метод выращивания',
    brand: 'Базовые удобрения',
    waterVolume: 'Объем воды',
    baseParams: 'Базовые параметры',
    basePh: 'Базовый pH',
    baseEc: 'Базовый EC (mS/cm)',
    baseTemp: 'Температура (°C)',
    additives: 'Добавки и стимуляторы',
    additivesDesc: 'Вы можете выбрать все что имеется у вас в наличии, в результатах будет отображено только то что применимо на данном этапе.',
    totalSelected: 'Всего выбрано',
    selected: 'выбрано',
    results: 'Результаты',
    resultsDesc: 'Ваш индивидуальный рецепт питательных веществ',
    baseNutrients: 'Базовые удобрения',
    nutrient: 'Линейка',
    per1L: 'На 1л',
    perXL: (v: number) => `На ${v}л`,
    basePhShort: 'Базовый pH',
    baseEcShort: 'Базовый EC',
    baseTempShort: 'Температура',
    ecRange: 'Диапазон EC',
    phRange: 'Диапазон pH',
    selectedAdditives: 'Выбранные добавки',
    additive: 'Добавка',
    copyResults: 'Копировать результаты',
    exportPDF: 'Экспорт в PDF',
    nutrientSettings: 'База и объем',
    nutrientSettingsDesc: 'Выберите бренд, объем воды и базовые параметры',
  } : {
    appTitle: 'Precision Nutrient Calculator',
    growParams: 'Method & Stage',
    growParamsDesc: 'Select your growing method and current growth stage',
    growMethod: 'Growing Method',
    brand: 'Base nutrients',
    waterVolume: 'Water Volume',
    baseParams: 'Base Parameters',
    basePh: 'Base pH',
    baseEc: 'Base EC (mS/cm)',
    baseTemp: 'Temperature (°C)',
    additives: 'Additives & Stimulants',
    additivesDesc: 'You can select everything you have in stock, and the results will only show what is applicable at this stage.',
    totalSelected: 'Total Selected',
    selected: 'selected',
    results: 'Results',
    resultsDesc: 'Your custom nutrient recipe',
    baseNutrients: 'Base Nutrients',
    nutrient: 'Nutrient',
    per1L: 'Per 1L',
    perXL: (v: number) => `Per ${v}L`,
    basePhShort: 'Base pH',
    baseEcShort: 'Base EC',
    baseTempShort: 'Temperature',
    ecRange: 'EC Range',
    phRange: 'pH Range',
    selectedAdditives: 'Selected Additives',
    additive: 'Additive',
    copyResults: 'Copy Results',
    exportPDF: 'Export PDF',
    nutrientSettings: 'Base & Volume',
    nutrientSettingsDesc: 'Configure your nutrient brand, water volume, and base parameters',
  }

  // --- New state for additive brands selection (independent from section 2) ---
  const [selectedAdditiveBrands, setSelectedAdditiveBrands] = useState<string[]>(brands.length ? [brands[0].code] : []);

  // Helper to toggle additive brand selection
  const toggleAdditiveBrand = (brandCode: string) => {
    setSelectedAdditiveBrands(prev =>
      prev.includes(brandCode)
        ? prev.filter(code => code !== brandCode)
        : [...prev, brandCode]
    );
  };

  // --- Helper to reset all additive selections ---
  const resetAdditives = () => {
    setSelectedAdditiveBrands([]);
    setSelectedAdditives([]);
  };

  // Filtered additives by selected brands
  const rootAdditives: (Additive & { brand: string })[] = brands
    .filter(b => selectedAdditiveBrands.includes(b.code))
    .flatMap(brand =>
      dataService.getAdditives(brand.code)
        .filter(additive => !additive.id.startsWith('general-') && additive.application !== 'foliar')
        .map(additive => ({ ...additive, brand: brand.code }))
    );
  const foliarAdditives: (Additive & { brand: string })[] = brands
    .filter(b => selectedAdditiveBrands.includes(b.code))
    .flatMap(brand =>
      dataService.getAdditives(brand.code)
        .filter(additive => additive.application === 'foliar')
        .map(additive => ({ ...additive, brand: brand.code }))
    );

  return (
    <TooltipProvider>
      <div className={`container mx-auto px-4 py-8 ${className}`}>
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              SimplexCalc
            </h1>
            <p className="text-muted-foreground">{labels.appTitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <SettingsToggle
              hideDescriptions={hideDescriptions}
              onHideDescriptionsChange={setHideDescriptions}
              isProMode={isProMode}
              onIsProModeChange={setIsProMode}
              isRussian={isRussian}
              onIsRussianChange={setIsRussian}
              showAverageValues={showAverageValues}
              onShowAverageValuesChange={setShowAverageValues}
            />
            {showThemeToggle && <ThemeToggle />}
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {/* Section 1: Growing Parameters */}
          <Card className="border-2 transition-all duration-200 hover:shadow-lg">
            <CardHeader>
              <div className="flex items-start gap-3">
                <span className="inline-block w-6 h-6 rounded-full bg-primary text-primary-foreground text-center font-medium text-sm flex-shrink-0 mt-1">
                  1
                </span>
                <div className="flex-1">
                  <CardTitle className="text-left">{labels.growParams}</CardTitle>
                  {!hideDescriptions && (
                    <CardDescription className="text-left">{labels.growParamsDesc}</CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Grow Method Selection */}
                <div className="space-y-3">
                  <h4>{labels.growMethod}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div
                      className={`unified-card unified-card-medium ${
                        growMethod === 'soil' ? 'selected' : ''
                      } ${hideDescriptions ? 'hide-descriptions' : ''}`}
                      onClick={() => setGrowMethod('soil')}
                    >
                      <Leaf className="h-5 w-5 unified-card-icon text-green-600" />
                      <div className="unified-card-content">
                        <h5 className="unified-card-label">{isRussian ? GROW_METHOD_LABELS_RU[GROW_METHODS.SOIL] : GROW_METHOD_LABELS[GROW_METHODS.SOIL]}</h5>
                        {!hideDescriptions && (
                          <span className="unified-card-description">{isRussian ? GROW_METHOD_DESCRIPTIONS_RU[GROW_METHODS.SOIL] : GROW_METHOD_DESCRIPTIONS[GROW_METHODS.SOIL]}</span>
                        )}
                      </div>
                    </div>
                    <div
                      className={`unified-card unified-card-medium ${
                        growMethod === 'coco' ? 'selected' : ''
                      } ${hideDescriptions ? 'hide-descriptions' : ''}`}
                      onClick={() => setGrowMethod('coco')}
                    >
                      <TreePine className="h-5 w-5 unified-card-icon text-orange-700" />
                      <div className="unified-card-content">
                        <h5 className="unified-card-label">{isRussian ? GROW_METHOD_LABELS_RU[GROW_METHODS.COCO] : GROW_METHOD_LABELS[GROW_METHODS.COCO]}</h5>
                        {!hideDescriptions && (
                          <span className="unified-card-description">{isRussian ? GROW_METHOD_DESCRIPTIONS_RU[GROW_METHODS.COCO] : GROW_METHOD_DESCRIPTIONS[GROW_METHODS.COCO]}</span>
                        )}
                      </div>
                    </div>
                    <div
                      className={`unified-card unified-card-medium ${
                        growMethod === 'hydroponic' ? 'selected' : ''
                      } ${hideDescriptions ? 'hide-descriptions' : ''}`}
                      onClick={() => setGrowMethod('hydroponic')}
                    >
                      <Droplets className="h-5 w-5 unified-card-icon text-blue-500" />
                      <div className="unified-card-content">
                        <h5 className="unified-card-label">{isRussian ? GROW_METHOD_LABELS_RU[GROW_METHODS.HYDROPONIC] : GROW_METHOD_LABELS[GROW_METHODS.HYDROPONIC]}</h5>
                        {!hideDescriptions && (
                          <span className="unified-card-description">{isRussian ? GROW_METHOD_DESCRIPTIONS_RU[GROW_METHODS.HYDROPONIC] : GROW_METHOD_DESCRIPTIONS[GROW_METHODS.HYDROPONIC]}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Growth Stage Selection */}
                <div className="space-y-3">
                  <h4>Growth Stage</h4>
                  <div className="space-y-3">
                    {/* First row of stages */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div
                        className={`unified-card unified-card-small ${
                          growthStage === 'germination' ? 'selected' : ''
                        } ${hideDescriptions ? 'hide-descriptions' : ''}`}
                        onClick={() => setGrowthStage('germination')}
                      >
                        <Seedling className="h-4 w-4 unified-card-icon text-green-500" />
                        <div className="unified-card-content">
                          <h5 className="unified-card-label">{isRussian ? GROWTH_STAGE_LABELS_RU[GROWTH_STAGES.GERMINATION] : GROWTH_STAGE_LABELS[GROWTH_STAGES.GERMINATION]}</h5>
                          {!hideDescriptions && (
                            <span className="unified-card-description">{isRussian ? GROWTH_STAGE_DESCRIPTIONS_RU[GROWTH_STAGES.GERMINATION] : GROWTH_STAGE_DESCRIPTIONS[GROWTH_STAGES.GERMINATION]}</span>
                          )}
                        </div>
                      </div>
                      <div
                        className={`unified-card unified-card-small ${
                          growthStage === 'vegetative' ? 'selected' : ''
                        } ${hideDescriptions ? 'hide-descriptions' : ''}`}
                        onClick={() => setGrowthStage('vegetative')}
                      >
                        <Leaf className="h-4 w-4 unified-card-icon text-emerald-600" />
                        <div className="unified-card-content">
                          <h5 className="unified-card-label">{isRussian ? GROWTH_STAGE_LABELS_RU[GROWTH_STAGES.VEGETATIVE] : GROWTH_STAGE_LABELS[GROWTH_STAGES.VEGETATIVE]}</h5>
                          {!hideDescriptions && (
                            <span className="unified-card-description">{isRussian ? GROWTH_STAGE_DESCRIPTIONS_RU[GROWTH_STAGES.VEGETATIVE] : GROWTH_STAGE_DESCRIPTIONS[GROWTH_STAGES.VEGETATIVE]}</span>
                          )}
                        </div>
                      </div>
                      <div
                        className={`unified-card unified-card-small ${
                          growthStage === 'pre-flowering' ? 'selected' : ''
                        } ${hideDescriptions ? 'hide-descriptions' : ''}`}
                        onClick={() => setGrowthStage('pre-flowering')}
                      >
                        <Flower className="h-4 w-4 unified-card-icon text-yellow-500" />
                        <div className="unified-card-content">
                          <h5 className="unified-card-label">{isRussian ? GROWTH_STAGE_LABELS_RU[GROWTH_STAGES.PRE_FLOWERING] : GROWTH_STAGE_LABELS[GROWTH_STAGES.PRE_FLOWERING]}</h5>
                          {!hideDescriptions && (
                            <span className="unified-card-description">{isRussian ? GROWTH_STAGE_DESCRIPTIONS_RU[GROWTH_STAGES.PRE_FLOWERING] : GROWTH_STAGE_DESCRIPTIONS[GROWTH_STAGES.PRE_FLOWERING]}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Second row of stages */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div
                        className={`unified-card unified-card-small ${
                          growthStage === 'flowering-start' ? 'selected' : ''
                        } ${hideDescriptions ? 'hide-descriptions' : ''}`}
                        onClick={() => setGrowthStage('flowering-start')}
                      >
                        <Flower className="h-4 w-4 unified-card-icon text-orange-500" />
                        <div className="unified-card-content">
                          <h5 className="unified-card-label">{isRussian ? GROWTH_STAGE_LABELS_RU[GROWTH_STAGES.FLOWERING_START] : GROWTH_STAGE_LABELS[GROWTH_STAGES.FLOWERING_START]}</h5>
                          {!hideDescriptions && (
                            <span className="unified-card-description">{isRussian ? GROWTH_STAGE_DESCRIPTIONS_RU[GROWTH_STAGES.FLOWERING_START] : GROWTH_STAGE_DESCRIPTIONS[GROWTH_STAGES.FLOWERING_START]}</span>
                          )}
                        </div>
                      </div>
                      <div
                        className={`unified-card unified-card-small ${
                          growthStage === 'flower-dev' ? 'selected' : ''
                        } ${hideDescriptions ? 'hide-descriptions' : ''}`}
                        onClick={() => setGrowthStage('flower-dev')}
                      >
                        <Sun className="h-4 w-4 unified-card-icon text-amber-600" />
                        <div className="unified-card-content">
                          <h5 className="unified-card-label">{isRussian ? GROWTH_STAGE_LABELS_RU[GROWTH_STAGES.FLOWER_DEV] : GROWTH_STAGE_LABELS[GROWTH_STAGES.FLOWER_DEV]}</h5>
                          {!hideDescriptions && (
                            <span className="unified-card-description">{isRussian ? GROWTH_STAGE_DESCRIPTIONS_RU[GROWTH_STAGES.FLOWER_DEV] : GROWTH_STAGE_DESCRIPTIONS[GROWTH_STAGES.FLOWER_DEV]}</span>
                          )}
                        </div>
                      </div>
                      <div
                        className={`unified-card unified-card-small ${
                          growthStage === 'ripening' ? 'selected' : ''
                        } ${hideDescriptions ? 'hide-descriptions' : ''}`}
                        onClick={() => setGrowthStage('ripening')}
                      >
                        <Moon className="h-4 w-4 unified-card-icon text-yellow-500" />
                        <div className="unified-card-content">
                          <h5 className="unified-card-label">{isRussian ? GROWTH_STAGE_LABELS_RU[GROWTH_STAGES.RIPENING] : GROWTH_STAGE_LABELS[GROWTH_STAGES.RIPENING]}</h5>
                          {!hideDescriptions && (
                            <span className="unified-card-description">{isRussian ? GROWTH_STAGE_DESCRIPTIONS_RU[GROWTH_STAGES.RIPENING] : GROWTH_STAGE_DESCRIPTIONS[GROWTH_STAGES.RIPENING]}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Third row - Flushing stage */}
                    <div className="grid grid-cols-1 gap-2">
                      <div
                        className={`unified-card unified-card-small ${
                          growthStage === 'flushing' ? 'selected' : ''
                        } ${hideDescriptions ? 'hide-descriptions' : ''}`}
                        onClick={() => setGrowthStage('flushing')}
                      >
                        <Droplet className="h-4 w-4 unified-card-icon text-blue-500" />
                        <div className="unified-card-content">
                          <h5 className="unified-card-label">{isRussian ? GROWTH_STAGE_LABELS_RU[GROWTH_STAGES.FLUSHING] : GROWTH_STAGE_LABELS[GROWTH_STAGES.FLUSHING]}</h5>
                          {!hideDescriptions && (
                            <span className="unified-card-description">{isRussian ? GROWTH_STAGE_DESCRIPTIONS_RU[GROWTH_STAGES.FLUSHING] : GROWTH_STAGE_DESCRIPTIONS[GROWTH_STAGES.FLUSHING]}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Nutrient Settings and Base */}
          <Card className="section-card">
            <CardHeader>
              <div className="flex items-start gap-3">
                <span className="inline-block w-6 h-6 rounded-full bg-primary text-primary-foreground text-center font-medium text-sm flex-shrink-0 mt-1">
                  2
                </span>
                <div className="flex-1">
                  <CardTitle className="text-left">{labels.nutrientSettings}</CardTitle>
                  {!hideDescriptions && (
                    <CardDescription className="text-left">{labels.nutrientSettingsDesc}</CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4>{labels.brand}</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {brands.map((brand) => (
                        <div
                          key={brand.code}
                          className={`unified-card unified-card-large ${
                            nutrientBrand === brand.code ? 'selected' : ''
                          } ${hideDescriptions ? 'hide-descriptions' : ''}`}
                          onClick={() => {
                            setNutrientBrand(brand.code)
                            setSelectedAdditives([])
                          }}
                        >
                          <div className="unified-card-content">
                            <h5 className="unified-card-label">{brand.name}</h5>
                            {!hideDescriptions && (
                              <span className="unified-card-description">{isRussian && brand.description_ru ? brand.description_ru : brand.description}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4>{labels.waterVolume}</h4>
                  <div className="flex items-center justify-center">
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <div className="relative w-20">
                        <input
                          type="text"
                          value={`${waterVolume}L`}
                          onChange={(e) => {
                            const value = e.target.value.replace('L', '');
                            if (value === '' || !isNaN(Number(value))) {
                              setWaterVolume(value === '' ? 0 : Number(value));
                            }
                          }}
                          className="text-xl font-bold w-full h-[48px] text-center bg-transparent border-none focus:outline-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-5 w-5 flex items-center justify-center"
                          onClick={() => setWaterVolume(prev => Number((prev + 0.1).toFixed(1)))}
                        >
                          <span className="text-sm flex items-center justify-center">+</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-5 w-5 flex items-center justify-center"
                          onClick={() => setWaterVolume(prev => Math.max(0, Number((prev - 0.1).toFixed(1))))}
                        >
                          <span className="text-sm flex items-center justify-center">-</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center mt-4">
                    <div className="w-full max-w-md">
                      <Slider
                        value={[Math.min(waterVolume, 100)]}
                        min={0.1}
                        max={100}
                        step={0.1}
                        onValueChange={(value) => setWaterVolume(Number(value[0].toFixed(1)))}
                      />
                    </div>
                  </div>
                </div>

                {isProMode && (
                  <div className="space-y-2">
                    <h4>{labels.baseParams}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* pH Input */}
                      <div className="space-y-2">
                        <Label htmlFor="basePh">{labels.basePh}</Label>
                        <div className="flex items-center justify-center">
                          <div className="flex flex-col items-center justify-center gap-0.5">
                            <div className="relative w-20">
                              <input
                                type="text"
                                value={`${basePh}`}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === '' || !isNaN(Number(value))) {
                                    const numValue = value === '' ? 0 : Number(value);
                                    if (numValue >= 4 && numValue <= 9) {
                                      setBasePh(numValue);
                                    }
                                  }
                                }}
                                className="text-xl font-bold w-full h-[48px] text-center bg-transparent border-none focus:outline-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-5 w-5 flex items-center justify-center"
                                onClick={() => setBasePh(prev => Math.min(9, Number((prev + 0.1).toFixed(1))))}
                              >
                                <span className="text-sm flex items-center justify-center">+</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-5 w-5 flex items-center justify-center"
                                onClick={() => setBasePh(prev => Math.max(4, Number((prev - 0.1).toFixed(1))))}
                              >
                                <span className="text-sm flex items-center justify-center">-</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* EC Input */}
                      <div className="space-y-2">
                        <Label htmlFor="baseEc">{labels.baseEc}</Label>
                        <div className="flex items-center justify-center">
                          <div className="flex flex-col items-center justify-center gap-0.5">
                            <div className="relative w-20">
                              <input
                                type="text"
                                value={`${baseEc}`}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === '' || !isNaN(Number(value))) {
                                    const numValue = value === '' ? 0 : Number(value);
                                    if (numValue >= 0.1 && numValue <= 5) {
                                      setBaseEc(numValue);
                                    }
                                  }
                                }}
                                className="text-xl font-bold w-full h-[48px] text-center bg-transparent border-none focus:outline-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-5 w-5 flex items-center justify-center"
                                onClick={() => setBaseEc(prev => Math.min(5, Number((prev + 0.1).toFixed(1))))}
                              >
                                <span className="text-sm flex items-center justify-center">+</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-5 w-5 flex items-center justify-center"
                                onClick={() => setBaseEc(prev => Math.max(0.1, Number((prev - 0.1).toFixed(1))))}
                              >
                                <span className="text-sm flex items-center justify-center">-</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Temperature Input */}
                      <div className="space-y-2">
                        <Label htmlFor="baseTemperature">{labels.baseTemp}</Label>
                        <div className="flex items-center justify-center">
                          <div className="flex flex-col items-center justify-center gap-0.5">
                            <div className="relative w-20">
                              <input
                                type="text"
                                value={`${baseTemperature}`}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === '' || !isNaN(Number(value))) {
                                    const numValue = value === '' ? 0 : Number(value);
                                    if (numValue >= 0 && numValue <= 40) {
                                      setBaseTemperature(Math.round(numValue));
                                    }
                                  }
                                }}
                                className="text-xl font-bold w-full h-[48px] text-center bg-transparent border-none focus:outline-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-5 w-5 flex items-center justify-center"
                                onClick={() => setBaseTemperature(prev => Math.min(40, prev + 1))}
                              >
                                <span className="text-sm flex items-center justify-center">+</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-5 w-5 flex items-center justify-center"
                                onClick={() => setBaseTemperature(prev => Math.max(0, prev - 1))}
                              >
                                <span className="text-sm flex items-center justify-center">-</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Additives */}
          <Card className="section-card">
            <CardHeader>
              <div className="flex items-start gap-3 justify-between">
              <div className="flex items-start gap-3">
                <span className="inline-block w-6 h-6 rounded-full bg-primary text-primary-foreground text-center font-medium text-sm flex-shrink-0 mt-1">
                  3
                </span>
                <div className="flex-1">
                  <CardTitle className="text-left">{labels.additives}</CardTitle>
                  {!hideDescriptions && (
                    <CardDescription className="text-left">{labels.additivesDesc}</CardDescription>
                  )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Additive Brand Selection */}
                <div>
                  <h4 className="mb-2">{isRussian ? 'Бренд' : 'Brand'}</h4>
                  <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 mb-4">
                    {brands.map(brand => (
                      <div
                        key={brand.code}
                        className={`unified-card unified-card-small ${selectedAdditiveBrands.includes(brand.code) ? 'selected' : ''}`}
                        onClick={() => toggleAdditiveBrand(brand.code)}
                      >
                        <div className="unified-card-content">
                          <h5 className="unified-card-label">{brand.name}</h5>
                          {!hideDescriptions && (
                            <span className="unified-card-description line-clamp-2">{isRussian && brand.description_ru ? brand.description_ru : brand.description}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Root Additives */}
                {selectedAdditiveBrands.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-semibold flex items-center justify-center gap-2">
                      <Droplet className="h-5 w-5 text-green-600" />
                      {isRussian ? 'Добавки для корневого полива' : 'Root Additives'}
                      </h4>
                    <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
                      {rootAdditives
                        .filter((additive) => isProMode || !(/^0(\.0*)?(ml|мл)?$/i.test(((additive.stages as Record<string, string>)[growthStage] || "0").trim())))
                        .map((additive) => {
                          const dose = (additive.stages as Record<string, string>)[growthStage] || "0";
                          const isZero = !dose || /^0(\.0*)?(ml|мл)?$/i.test(dose.trim());
                          return (
                            <div
                              key={`${additive.brand}-${additive.id}`}
                              className={`unified-card unified-card-small ${isAdditiveSelected(additive.id, additive.brand) ? 'selected' : ''} ${hideDescriptions ? 'hide-descriptions' : ''} ${isZero ? 'card-strikethrough' : ''}`}
                              onClick={() => toggleAdditive(additive.id, additive.brand)}
                              style={{ position: 'relative', overflow: 'hidden' }}
                            >
                              {isZero && (
                                <svg width="100%" height="100%" style={{ position: 'absolute', left: 0, top: 0, zIndex: 0, pointerEvents: 'none' }}>
                                  <line x1="0" y1="100%" x2="100%" y2="0" stroke="red" strokeWidth="3" />
                                  <line x1="0" y1="0" x2="100%" y2="100%" stroke="red" strokeWidth="3" />
                        </svg>
                              )}
                              <div className="unified-card-content" style={{ position: 'relative', zIndex: 1 }}>
                                <h5 className="unified-card-label">{additive.name}</h5>
                                {!hideDescriptions && (
                                  <span className="unified-card-description line-clamp-2">{isRussian ? additive.description_ru : additive.description}</span>
                                )}
                                {!isZero && (
                                  <span className="unified-card-dose">
                                    {additive.application === 'foliar'
                                      ? dose
                                      : (isRussian ? `${dose}мл/л` : `${dose}ml/L`)
                                    }
                                  </span>
                                )}
                      </div>
                    </div>
                          )
                        })}
                    </div>
                  </div>
                )}
                {/* Foliar Additives */}
                {selectedAdditiveBrands.length > 0 && foliarAdditives.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-semibold flex items-center justify-center gap-2">
                      <SprayCan className="h-5 w-5 text-sky-500" />
                      {isRussian ? 'Для обработки по листу' : 'For Leaf Spray'}
                    </h4>
                    <div style={{height: '1em'}} />
                    <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
                      {foliarAdditives
                        .filter((additive) => isProMode || (() => {
                          const hasStages = 'stages' in additive && typeof additive.stages === 'object';
                          const stageDose = hasStages ? (additive.stages as Record<string, string>)[growthStage] : undefined;
                          return !(!stageDose || /^0(\.0*)?(ml|мл)?$/i.test((stageDose ?? '').trim()));
                        })())
                        .map((additive) => {

                          const hasStages = 'stages' in additive && typeof additive.stages === 'object';
                          const stageDose = hasStages ? (additive.stages as Record<string, string>)[growthStage] : undefined;
                          const isZero = !stageDose || /^0(\.0*)?(ml|мл)?$/i.test((stageDose ?? '').trim());
                          return (
                            <div
                              key={additive.id}
                              className={`unified-card unified-card-small ${isAdditiveSelected(additive.id, additive.brand) ? 'selected' : ''} ${hideDescriptions ? 'hide-descriptions' : ''} ${isZero ? 'card-strikethrough' : ''}`}
                              onClick={() => toggleAdditive(additive.id, additive.brand)}
                              style={{ position: 'relative', overflow: 'hidden' }}
                            >
                              {isZero && (
                                <svg width="100%" height="100%" style={{ position: 'absolute', left: 0, top: 0, zIndex: 0, pointerEvents: 'none' }}>
                                  <line x1="0" y1="100%" x2="100%" y2="0" stroke="red" strokeWidth="3" />
                                  <line x1="0" y1="0" x2="100%" y2="100%" stroke="red" strokeWidth="3" />
                                </svg>
                              )}
                              <div className="unified-card-content" style={{ position: 'relative', zIndex: 1 }}>
                                  <h5 className="unified-card-label">{additive.name}</h5>
                                  {!hideDescriptions && (
                                    <span className="unified-card-description line-clamp-2">{isRussian ? additive.description_ru : additive.description}</span>
                                  )}
                                {!isZero && (
                                  <span className="unified-card-dose">
                                    {(isRussian
                                        ? additive.foliarDose
                                        : additive.foliarDose?.replace(/капли/gi, 'drop').replace(/мл/gi, 'ml')
                                      )
                                    }
                                  </span>
                                )}
                                {!isZero && additive.defaultDose && additive.defaultDose !== '0' && (
                                  <span className="unified-card-dose text-xs text-muted-foreground">
                                    {isRussian ? `${additive.defaultDose}мл/л` : `${additive.defaultDose}ml/L`}
                                  </span>
                                )}
                                </div>
                              </div>
                          )
                        })}
                        </div>
                      </div>
                    )}
                
                {/* Counter and Reset Button */}
                <div className="rounded-md border p-3 mt-4">
                  <div className={`grid items-center gap-2 ${isProMode ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    {isProMode && (
                      <div className="flex items-center gap-2 justify-center">
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <span style={{ position: 'relative', display: 'inline-block', width: 28, height: 28, background: 'white', border: '1px solid #eee', borderRadius: 4, marginRight: 6 }}>
                            <svg width="100%" height="100%" style={{ position: 'absolute', left: 0, top: 0 }}>
                              <line x1="0" y1="100%" x2="100%" y2="0" stroke="red" strokeWidth="3" />
                              <line x1="0" y1="0" x2="100%" y2="100%" stroke="red" strokeWidth="3" />
                            </svg>
                          </span>
                          <span className="text-xs text-muted-foreground font-medium">
                            {isRussian ? 'Не рекомендуется на данной стадии!' : 'Not recommended at this stage!'}
                          </span>
                        </span>
                  </div>
                    )}
                    <div className="text-center font-semibold">
                      <span>{labels.totalSelected}: {selectedAdditives.length}</span>
                    </div>
                    <div className="text-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={resetAdditives}>
                              <RotateCcw className="h-5 w-5" />
                              <span className="sr-only">{isRussian ? 'Сбросить' : 'Reset'}</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{isRussian ? 'Сбросить выбор добавок' : 'Reset additive selection'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Results */}
          <Card id="printable-content" className="section-card">
            <CardHeader>
              <div className="flex items-start gap-3">
                <span className="inline-block w-6 h-6 rounded-full bg-primary text-primary-foreground text-center font-medium text-sm flex-shrink-0 mt-1">
                  4
                </span>
                <div className="flex-1">
                  <CardTitle className="text-left">{isRussian ? 'Рецепт' : 'Recipe'}</CardTitle>
                  {!hideDescriptions && (
                    <CardDescription className="text-left">
                      {isRussian ? 'Ваш индивидуальный рецепт питательных веществ' : 'Your custom nutrient recipe'}
                    </CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isProMode && (
                  <div className="space-y-2 mb-4">
                    <h4>{labels.baseParams}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="rounded-md border p-4 bg-accent/50 text-center">
                        <h4 className="mb-2">{labels.basePhShort}</h4>
                        <p className="text-lg font-bold">{basePh.toFixed(1)}</p>
                      </div>
                      <div className="rounded-md border p-4 bg-accent/50 text-center">
                        <h4 className="mb-2">{labels.baseEcShort}</h4>
                        <p className="text-lg font-bold">{baseEc.toFixed(1)}</p>
                      </div>
                      <div className="rounded-md border p-4 bg-accent/50 text-center">
                        <h4 className="mb-2">{labels.baseTempShort}</h4>
                        <p className="text-lg font-bold">{baseTemperature}°C</p>
                      </div>
                    </div>
                  </div>
                )}
                {results.nutrients.length > 0 && (
                  <>
                    {/* Блок с четырьмя колонками (Метод/Этап и Бренд/Добавки) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="rounded-md border p-4 bg-accent/50 min-h-[96px]">
                        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-stretch h-full">
                          <div className="flex flex-col justify-center items-center h-full text-center">
                            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{isRussian ? 'Метод' : 'Method'}</h4>
                            <span className="text-lg font-bold">{isRussian ? GROW_METHOD_LABELS_RU[growMethod] : GROW_METHOD_LABELS[growMethod]}</span>
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
                            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{isRussian ? 'Бренд' : 'Brand'}</h4>
                            <span className="text-lg font-bold">{brands.find(b => b.code === nutrientBrand)?.name || ''}</span>
                          </div>
                          <div className="border-r h-full" />
                          <div className="flex flex-col justify-center items-center h-full text-center">
                            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center w-full">{isRussian ? 'Добавки' : 'Additives'}</h4>
                            <span className="text-lg font-bold text-center w-full">{isRussian ? (selectedAdditives.length > 0 ? 'Да' : 'Нет') : (selectedAdditives.length > 0 ? 'Yes' : 'No')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Блок с иконками и диапазонами EC/PH */}
                {results.recommendations && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="rounded-md border p-4 bg-accent/50">
                      <div className="grid grid-cols-[1fr_auto_1fr] gap-4">
                        <div className="flex items-center justify-center">
                          <Gem className="h-8 w-8 text-blue-500" />
                        </div>
                        <div className="border-r" />
                            <div className="flex flex-col justify-center items-center">
                          <h4 className="mb-2">{labels.ecRange}</h4>
                          <p className="text-lg font-bold border-b-2 border-blue-500 pb-1">{results.recommendations.ec}</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-md border p-4 bg-accent/50">
                      <div className="grid grid-cols-[1fr_auto_1fr] gap-4">
                        <div className="flex items-center justify-center">
                          <Citrus className="h-8 w-8 text-amber-500" />
                        </div>
                        <div className="border-r" />
                            <div className="flex flex-col justify-center items-center">
                          <h4 className="mb-2">{labels.phRange}</h4>
                          <p className="text-lg font-bold border-b-2 border-amber-500 pb-1">{results.recommendations.ph}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                  <div className="space-y-2">
                      <h4>{labels.baseNutrients}</h4>
                    <div className="grid gap-2">
                        <div className="grid grid-cols-3 gap-2 rounded-md border p-2 bg-muted/50 text-center">
                          <span className="text-sm font-semibold text-center">{labels.nutrient}</span>
                        <span className="text-sm font-semibold text-center">{labels.per1L}</span>
                        <span className="text-sm font-semibold text-center">{labels.perXL(waterVolume)}</span>
                      </div>
                        {nutrientDisplayItems}
                          </div>
                    </div>

                    {/* ВОССТАНОВЛЕННЫЙ БЛОК: Таблица с результатами для добавок */}
                    {results.additives.length > 0 && (
                      <div className="space-y-2 mt-6">
                        {/* Корневые добавки */}
                        {results.additives.filter(a => a.application !== 'foliar').length > 0 && (
                          <>
                            <h4>{isRussian ? 'Добавки & Стимуляторы' : 'Root Additives'}</h4>
                            <div className="grid gap-2">
                              <div className="grid grid-cols-3 gap-2 rounded-md border p-2 bg-muted/50 text-center">
                                <span className="text-sm font-semibold text-center">{isRussian ? 'Под корень' : 'Root'}</span>
                                <span className="text-sm font-semibold text-center">{labels.per1L}</span>
                                <span className="text-sm font-semibold text-center">{labels.perXL(waterVolume)}</span>
                              </div>
                              {results.additives.filter(a => a.application !== 'foliar').map((add, idx) => (
                                <div key={add.id + idx} className={`grid grid-cols-3 gap-2 rounded-md border p-2 text-center ${add.isZero ? 'opacity-60 line-through' : ''}`}>
                                  <span className="text-sm font-medium">{add.name}</span>
                                  <span className="data-description">{add.defaultDose}</span>
                                  <span className="data-description">
                                    {add.amountRange === '-' ? '-' : `${add.amountRange}${isRussian ? 'мл' : 'ml'}`}
                                  </span>
                                </div>
                              ))}
                    </div>
                          </>
                        )}
                        {/* Листовые добавки */}
                        {results.additives.filter(a => a.application === 'foliar').length > 0 && (
                          <>
                            <div style={{height: '1em'}} />
                            <div className="grid gap-2">
                              <div className="grid grid-cols-3 gap-2 rounded-md border p-2 bg-muted/50 text-center">
                                <span className="text-sm font-semibold text-center">{isRussian ? 'По листу' : 'Foliar'}</span>
                                <span className="text-sm font-semibold text-center">{isRussian ? 'Капли' : 'Spray'}</span>
                                <span className="text-sm font-semibold text-center">{isRussian ? 'На 1л' : 'Per 1L'}</span>
                              </div>
                              {results.additives.filter(a => a.application === 'foliar').map((add, idx) => (
                                <div key={add.id + idx} className={`grid grid-cols-3 gap-2 rounded-md border p-2 text-center ${add.isZero ? 'opacity-60 line-through' : ''}`}>
                                  <span className="text-sm font-medium">{add.name}</span>
                                  <span className="data-description">{add.foliarDose ? add.foliarDose : '-'}</span>
                                  <span className="data-description">
                                    {add.defaultDose === '-' ? '-' : `${add.defaultDose}${isRussian ? 'мл/л' : 'ml/L'}`}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <Button onClick={handleCopyResults} variant="outline" className="flex-1">
                  <Copy className="mr-2 h-4 w-4" />
                  {labels.copyResults}
                </Button>
                <Button onClick={handleExportPDF} variant="outline" className="flex-1">
                  <FileDown className="mr-2 h-4 w-4" />
                  {labels.exportPDF}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}