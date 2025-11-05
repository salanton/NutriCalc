import { useState, useEffect } from "react"
import { Droplet, Leaf, SproutIcon as Seedling, Sun, Flower, Moon, Check, Minus, Plus, TreePine, Droplets, SprayCan, Waves } from "lucide-react"
import { SectionCard } from "@/components/section-card"
import { Button } from "@/components/ui/button"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel"
import { useCalculatorWithSettings } from '@/hooks/useCalculatorWithSettings'
import {
  GROWTH_STAGES, GROWTH_STAGE_LABELS, GROWTH_STAGE_DESCRIPTIONS,
  GROWTH_STAGE_LABELS_RU, GROWTH_STAGE_DESCRIPTIONS_RU
} from '@/constants/growth-stages'
import { 
  GROW_METHODS, GROW_METHOD_LABELS, GROW_METHOD_DESCRIPTIONS,
  GROW_METHOD_LABELS_RU, GROW_METHOD_DESCRIPTIONS_RU
} from '@/constants/grow-methods'
import { BottomNavigation } from "@/components/bottom-navigation"

export default function HomePage() {
  const {
    waterVolume,
    setWaterVolume,
    growMethod,
    toggleGrowMethod,
    growthStage,
    setGrowthStage,
    isRussian,
    hideDescriptions,
  } = useCalculatorWithSettings()

  const [api, setApi] = useState<CarouselApi>()
  const [methodApi, setMethodApi] = useState<CarouselApi>()
  const [, setWateringMethodApi] = useState<CarouselApi>()
  const stageMap = ['germination', 'vegetative', 'pre-flowering', 'flowering-start', 'flower-dev', 'ripening', 'flushing']
  const methodMap = ['soil', 'hydroponic', 'coco']
  
  // Состояние для метода полива
  const [wateringMethod, setWateringMethod] = useState<'manual' | 'drip' | 'hydroponic'>('manual')

  // Sync method carousel to growMethod changes
  useEffect(() => {
    if (!methodApi) {
      return
    }

    const methodIndex = methodMap.indexOf(growMethod || '')
    if (methodIndex !== -1 && methodApi.selectedScrollSnap() !== methodIndex) {
      methodApi.scrollTo(methodIndex)
    }
  }, [methodApi, growMethod, methodMap])

  // Listen for method carousel slide changes
  useEffect(() => {
    if (!methodApi) {
      return
    }

    const onSelect = () => {
      const selectedIndex = methodApi.selectedScrollSnap()
      const method = methodMap[selectedIndex]
      if (method && method !== growMethod) {
        toggleGrowMethod(method as any)
      }
    }

    methodApi.on('select', onSelect)

    return () => {
      methodApi.off('select', onSelect)
    }
  }, [methodApi, toggleGrowMethod, growMethod, methodMap])

  // Sync carousel to growthStage changes
  useEffect(() => {
    if (!api) {
      return
    }

    const stageIndex = stageMap.indexOf(growthStage)
    if (stageIndex !== -1 && api.selectedScrollSnap() !== stageIndex) {
      api.scrollTo(stageIndex)
    }
  }, [api, growthStage, stageMap])

  // Listen for carousel slide changes
  useEffect(() => {
    if (!api) {
      return
    }

    const onSelect = () => {
      const selectedIndex = api.selectedScrollSnap()
      const stage = stageMap[selectedIndex]
      if (stage && stage !== growthStage) {
        setGrowthStage(stage as any)
      }
    }

    api.on('select', onSelect)

    return () => {
      api.off('select', onSelect)
    }
  }, [api, setGrowthStage, growthStage, stageMap])

  return (
    <TooltipProvider>
        <div className="container mx-auto px-4 py-8 pb-24 max-w-4xl" id="printable-content">
        <header className="mb-8">
          <div className="pl-4">
            <h1 className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent text-left">
              {isRussian ? 'Основные' : 'Main'}
            </h1>
            {!hideDescriptions && (
              <p className="text-muted-foreground text-left">{isRussian ? 'Основные параметры расчета' : 'Main calculation parameters'}</p>
            )}
          </div>
        </header>

        <div className="space-y-6">
          {/* Grow Method Selection */}
          <SectionCard
            title={isRussian ? "Метод" : "Method"}
            description={isRussian ? "Выберите метод выращивания" : "Select growing method"}
            icon={Flower}
            iconColor="text-green-500"
            hideDescriptions={hideDescriptions}
          >
            <div className="space-y-3">
              <Carousel
                opts={{
                  align: "center",
                  loop: false,
                  slidesToScroll: 1,
                }}
                setApi={setMethodApi}
                className="w-full"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  <CarouselItem className="pl-2 md:pl-4 md:basis-1/2">
                    <div
                      className={`unified-card unified-card-medium ${
                        growMethod === 'soil' ? 'selected' : ''
                      } ${hideDescriptions ? 'hide-descriptions' : ''} cursor-pointer relative`}
                      onClick={() => toggleGrowMethod('soil')}
                    >
                      {growMethod === 'soil' && (
                        <Check className="h-4 w-4 text-orange-500 absolute top-2 right-2" />
                      )}
                      <Leaf className="h-5 w-5 unified-card-icon text-green-600" />
                      <div className="unified-card-content">
                        <h5 className="unified-card-label">{isRussian ? GROW_METHOD_LABELS_RU[GROW_METHODS.SOIL] : GROW_METHOD_LABELS[GROW_METHODS.SOIL]}</h5>
                        {!hideDescriptions && (
                          <span className="unified-card-description">{isRussian ? GROW_METHOD_DESCRIPTIONS_RU[GROW_METHODS.SOIL] : GROW_METHOD_DESCRIPTIONS[GROW_METHODS.SOIL]}</span>
                        )}
                      </div>
                    </div>
                  </CarouselItem>
                  <CarouselItem className="pl-2 md:pl-4 md:basis-1/2">
                    <div
                      className={`unified-card unified-card-medium ${
                        growMethod === 'hydroponic' ? 'selected' : ''
                      } ${hideDescriptions ? 'hide-descriptions' : ''} cursor-pointer relative`}
                      onClick={() => toggleGrowMethod('hydroponic')}
                    >
                      {growMethod === 'hydroponic' && (
                        <Check className="h-4 w-4 text-orange-500 absolute top-2 right-2" />
                      )}
                      <Droplets className="h-5 w-5 unified-card-icon text-blue-500" />
                      <div className="unified-card-content">
                        <h5 className="unified-card-label">{isRussian ? GROW_METHOD_LABELS_RU[GROW_METHODS.HYDROPONIC] : GROW_METHOD_LABELS[GROW_METHODS.HYDROPONIC]}</h5>
                        {!hideDescriptions && (
                          <span className="unified-card-description">{isRussian ? GROW_METHOD_DESCRIPTIONS_RU[GROW_METHODS.HYDROPONIC] : GROW_METHOD_DESCRIPTIONS[GROW_METHODS.HYDROPONIC]}</span>
                        )}
                      </div>
                    </div>
                  </CarouselItem>
                  <CarouselItem className="pl-2 md:pl-4 md:basis-1/2">
                    <div
                      className={`unified-card unified-card-medium ${
                        growMethod === 'coco' ? 'selected' : ''
                      } ${hideDescriptions ? 'hide-descriptions' : ''} cursor-pointer relative`}
                      onClick={() => toggleGrowMethod('coco')}
                    >
                      {growMethod === 'coco' && (
                        <Check className="h-4 w-4 text-orange-500 absolute top-2 right-2" />
                      )}
                      <TreePine className="h-5 w-5 unified-card-icon text-orange-700" />
                      <div className="unified-card-content">
                        <h5 className="unified-card-label">{isRussian ? GROW_METHOD_LABELS_RU[GROW_METHODS.COCO] : GROW_METHOD_LABELS[GROW_METHODS.COCO]}</h5>
                        {!hideDescriptions && (
                          <span className="unified-card-description">{isRussian ? GROW_METHOD_DESCRIPTIONS_RU[GROW_METHODS.COCO] : GROW_METHOD_DESCRIPTIONS[GROW_METHODS.COCO]}</span>
                        )}
                      </div>
                    </div>
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </SectionCard>

          {/* Growth Stage Selection */}
          <SectionCard
            title="Стадия роста"
            description="Выберите текущую стадию роста ваших растений"
            icon={Flower}
            iconColor="text-green-500"
            hideDescriptions={hideDescriptions}
          >
              <Carousel
                opts={{
                  align: "center",
                  loop: false,
                  slidesToScroll: 1,
                }}
                setApi={setApi}
                className="w-full"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {/* Germination */}
                  <CarouselItem className="pl-2 md:pl-4 md:basis-1/2">
                    <div
                      className={`unified-card unified-card-small ${
                        growthStage === 'germination' ? 'selected' : ''
                      } ${hideDescriptions ? 'hide-descriptions' : ''} cursor-pointer h-full relative`}
                      onClick={() => setGrowthStage('germination')}
                    >
                      {growthStage === 'germination' && (
                        <Check className="h-4 w-4 text-orange-500 absolute top-2 right-2" />
                      )}
                      <Seedling className="h-4 w-4 unified-card-icon text-green-500" />
                      <div className="unified-card-content">
                        <h5 className="unified-card-label">{isRussian ? GROWTH_STAGE_LABELS_RU[GROWTH_STAGES.GERMINATION] : GROWTH_STAGE_LABELS[GROWTH_STAGES.GERMINATION]}</h5>
                        {!hideDescriptions && (
                          <span className="unified-card-description">{isRussian ? GROWTH_STAGE_DESCRIPTIONS_RU[GROWTH_STAGES.GERMINATION] : GROWTH_STAGE_DESCRIPTIONS[GROWTH_STAGES.GERMINATION]}</span>
                        )}
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Vegetative */}
                  <CarouselItem className="pl-2 md:pl-4 md:basis-1/2">
                    <div
                      className={`unified-card unified-card-small ${
                        growthStage === 'vegetative' ? 'selected' : ''
                      }                       ${hideDescriptions ? 'hide-descriptions' : ''} cursor-pointer h-full relative`}
                      onClick={() => setGrowthStage('vegetative')}
                    >
                      {growthStage === 'vegetative' && (
                        <Check className="h-4 w-4 text-orange-500 absolute top-2 right-2" />
                      )}
                      <Leaf className="h-4 w-4 unified-card-icon text-emerald-600" />
                      <div className="unified-card-content">
                        <h5 className="unified-card-label">{isRussian ? GROWTH_STAGE_LABELS_RU[GROWTH_STAGES.VEGETATIVE] : GROWTH_STAGE_LABELS[GROWTH_STAGES.VEGETATIVE]}</h5>
                        {!hideDescriptions && (
                          <span className="unified-card-description">{isRussian ? GROWTH_STAGE_DESCRIPTIONS_RU[GROWTH_STAGES.VEGETATIVE] : GROWTH_STAGE_DESCRIPTIONS[GROWTH_STAGES.VEGETATIVE]}</span>
                        )}
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Pre-flowering */}
                  <CarouselItem className="pl-2 md:pl-4 md:basis-1/2">
                    <div
                      className={`unified-card unified-card-small ${
                        growthStage === 'pre-flowering' ? 'selected' : ''
                      } ${hideDescriptions ? 'hide-descriptions' : ''} cursor-pointer h-full relative`}
                      onClick={() => setGrowthStage('pre-flowering')}
                    >
                      {growthStage === 'pre-flowering' && (
                        <Check className="h-4 w-4 text-orange-500 absolute top-2 right-2" />
                      )}
                      <Flower className="h-4 w-4 unified-card-icon text-yellow-500" />
                      <div className="unified-card-content">
                        <h5 className="unified-card-label">{isRussian ? GROWTH_STAGE_LABELS_RU[GROWTH_STAGES.PRE_FLOWERING] : GROWTH_STAGE_LABELS[GROWTH_STAGES.PRE_FLOWERING]}</h5>
                        {!hideDescriptions && (
                          <span className="unified-card-description">{isRussian ? GROWTH_STAGE_DESCRIPTIONS_RU[GROWTH_STAGES.PRE_FLOWERING] : GROWTH_STAGE_DESCRIPTIONS[GROWTH_STAGES.PRE_FLOWERING]}</span>
                        )}
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Flowering Start */}
                  <CarouselItem className="pl-2 md:pl-4 md:basis-1/2">
                    <div
                      className={`unified-card unified-card-small ${
                        growthStage === 'flowering-start' ? 'selected' : ''
                      } ${hideDescriptions ? 'hide-descriptions' : ''} cursor-pointer h-full relative`}
                      onClick={() => setGrowthStage('flowering-start')}
                    >
                      {growthStage === 'flowering-start' && (
                        <Check className="h-4 w-4 text-orange-500 absolute top-2 right-2" />
                      )}
                      <Flower className="h-4 w-4 unified-card-icon text-orange-500" />
                      <div className="unified-card-content">
                        <h5 className="unified-card-label">{isRussian ? GROWTH_STAGE_LABELS_RU[GROWTH_STAGES.FLOWERING_START] : GROWTH_STAGE_LABELS[GROWTH_STAGES.FLOWERING_START]}</h5>
                        {!hideDescriptions && (
                          <span className="unified-card-description">{isRussian ? GROWTH_STAGE_DESCRIPTIONS_RU[GROWTH_STAGES.FLOWERING_START] : GROWTH_STAGE_DESCRIPTIONS[GROWTH_STAGES.FLOWERING_START]}</span>
                        )}
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Flower Development */}
                  <CarouselItem className="pl-2 md:pl-4 md:basis-1/2">
                    <div
                      className={`unified-card unified-card-small ${
                        growthStage === 'flower-dev' ? 'selected' : ''
                      } ${hideDescriptions ? 'hide-descriptions' : ''} cursor-pointer h-full relative`}
                      onClick={() => setGrowthStage('flower-dev')}
                    >
                      {growthStage === 'flower-dev' && (
                        <Check className="h-4 w-4 text-orange-500 absolute top-2 right-2" />
                      )}
                      <Sun className="h-4 w-4 unified-card-icon text-amber-600" />
                      <div className="unified-card-content">
                        <h5 className="unified-card-label">{isRussian ? GROWTH_STAGE_LABELS_RU[GROWTH_STAGES.FLOWER_DEV] : GROWTH_STAGE_LABELS[GROWTH_STAGES.FLOWER_DEV]}</h5>
                        {!hideDescriptions && (
                          <span className="unified-card-description">{isRussian ? GROWTH_STAGE_DESCRIPTIONS_RU[GROWTH_STAGES.FLOWER_DEV] : GROWTH_STAGE_DESCRIPTIONS[GROWTH_STAGES.FLOWER_DEV]}</span>
                        )}
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Ripening */}
                  <CarouselItem className="pl-2 md:pl-4 md:basis-1/2">
                    <div
                      className={`unified-card unified-card-small ${
                        growthStage === 'ripening' ? 'selected' : ''
                      } ${hideDescriptions ? 'hide-descriptions' : ''} cursor-pointer h-full relative`}
                      onClick={() => setGrowthStage('ripening')}
                    >
                      {growthStage === 'ripening' && (
                        <Check className="h-4 w-4 text-orange-500 absolute top-2 right-2" />
                      )}
                      <Moon className="h-4 w-4 unified-card-icon text-yellow-500" />
                      <div className="unified-card-content">
                        <h5 className="unified-card-label">{isRussian ? GROWTH_STAGE_LABELS_RU[GROWTH_STAGES.RIPENING] : GROWTH_STAGE_LABELS[GROWTH_STAGES.RIPENING]}</h5>
                        {!hideDescriptions && (
                          <span className="unified-card-description">{isRussian ? GROWTH_STAGE_DESCRIPTIONS_RU[GROWTH_STAGES.RIPENING] : GROWTH_STAGE_DESCRIPTIONS[GROWTH_STAGES.RIPENING]}</span>
                        )}
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Flushing */}
                  <CarouselItem className="pl-2 md:pl-4 md:basis-1/2">
                    <div
                      className={`unified-card unified-card-small ${
                        growthStage === 'flushing' ? 'selected' : ''
                      } ${hideDescriptions ? 'hide-descriptions' : ''} cursor-pointer h-full relative`}
                      onClick={() => setGrowthStage('flushing')}
                    >
                      {growthStage === 'flushing' && (
                        <Check className="h-4 w-4 text-orange-500 absolute top-2 right-2" />
                      )}
                      <Droplet className="h-4 w-4 unified-card-icon text-blue-500" />
                      <div className="unified-card-content">
                        <h5 className="unified-card-label">{isRussian ? GROWTH_STAGE_LABELS_RU[GROWTH_STAGES.FLUSHING] : GROWTH_STAGE_LABELS[GROWTH_STAGES.FLUSHING]}</h5>
                        {!hideDescriptions && (
                          <span className="unified-card-description">{isRussian ? GROWTH_STAGE_DESCRIPTIONS_RU[GROWTH_STAGES.FLUSHING] : GROWTH_STAGE_DESCRIPTIONS[GROWTH_STAGES.FLUSHING]}</span>
                        )}
                      </div>
                    </div>
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
          </SectionCard>

          {/* Watering Method Selection */}
          <SectionCard
            title={isRussian ? 'Метод полива' : 'Watering Method'}
            description={isRussian ? 'Выберите метод полива ваших растений' : 'Select your plant watering method'}
            icon={Droplet}
            iconColor="text-blue-500"
            hideDescriptions={hideDescriptions}
          >
            <Carousel
              opts={{
                align: "center",
                loop: false,
                slidesToScroll: 1,
              }}
              setApi={setWateringMethodApi}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {/* Manual Watering */}
                <CarouselItem className="pl-2 md:pl-4 md:basis-1/2">
                  <div
                    className={`unified-card unified-card-small ${
                      wateringMethod === 'manual' ? 'selected' : ''
                    } ${hideDescriptions ? 'hide-descriptions' : ''} cursor-pointer h-full relative`}
                    onClick={() => setWateringMethod('manual')}
                  >
                    {wateringMethod === 'manual' && (
                      <Check className="h-4 w-4 text-orange-500 absolute top-2 right-2" />
                    )}
                    <SprayCan className="h-4 w-4 unified-card-icon text-blue-500" />
                    <div className="unified-card-content">
                      <h5 className="unified-card-label">{isRussian ? 'Ручной полив' : 'Manual Watering'}</h5>
                      {!hideDescriptions && (
                        <span className="unified-card-description">{isRussian ? 'Традиционный полив вручную' : 'Traditional manual watering'}</span>
                      )}
                    </div>
                  </div>
                </CarouselItem>

                {/* Drip Irrigation */}
                <CarouselItem className="pl-2 md:pl-4 md:basis-1/2">
                  <div
                    className={`unified-card unified-card-small ${
                      wateringMethod === 'drip' ? 'selected' : ''
                    } ${hideDescriptions ? 'hide-descriptions' : ''} cursor-pointer h-full relative`}
                    onClick={() => setWateringMethod('drip')}
                  >
                    {wateringMethod === 'drip' && (
                      <Check className="h-4 w-4 text-orange-500 absolute top-2 right-2" />
                    )}
                    <Droplets className="h-4 w-4 unified-card-icon text-cyan-500" />
                    <div className="unified-card-content">
                      <h5 className="unified-card-label">{isRussian ? 'Капельный полив' : 'Drip Irrigation'}</h5>
                      {!hideDescriptions && (
                        <span className="unified-card-description">{isRussian ? 'Автоматическая система капельного полива' : 'Automatic drip irrigation system'}</span>
                      )}
                    </div>
                  </div>
                </CarouselItem>

                {/* Hydroponics */}
                <CarouselItem className="pl-2 md:pl-4 md:basis-1/2">
                  <div
                    className={`unified-card unified-card-small ${
                      wateringMethod === 'hydroponic' ? 'selected' : ''
                    } ${hideDescriptions ? 'hide-descriptions' : ''} cursor-pointer h-full relative`}
                    onClick={() => setWateringMethod('hydroponic')}
                  >
                    {wateringMethod === 'hydroponic' && (
                      <Check className="h-4 w-4 text-orange-500 absolute top-2 right-2" />
                    )}
                    <Waves className="h-4 w-4 unified-card-icon text-purple-500" />
                    <div className="unified-card-content">
                      <h5 className="unified-card-label">{isRussian ? 'Гидропоника' : 'Hydroponics'}</h5>
                      {!hideDescriptions && (
                        <span className="unified-card-description">{isRussian ? 'Выращивание без почвы на питательном растворе' : 'Growing without soil using nutrient solution'}</span>
                      )}
                    </div>
                  </div>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </SectionCard>

          {/* Volume Selection */}
          <SectionCard
            title="Объем воды"
            description="В рецепте будет отображен результат с учетом вашего объема"
            icon={Droplet}
            iconColor="text-orange-500"
            hideDescriptions={hideDescriptions}
          >
              <div className="flex items-center justify-center">
                <div className="flex flex-col items-center justify-center gap-2 w-full">
                  <div className="relative w-24">
                    <input
                      type="text"
                      value={`${waterVolume}`}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || !isNaN(Number(value))) {
                          const numValue = value === '' ? 0 : Number(value);
                          if (numValue >= 0 && numValue <= 50) {
                            setWaterVolume(numValue);
                          }
                        }
                      }}
                      className="text-2xl font-bold text-blue-600 w-full h-[48px] text-center bg-transparent border-none focus:outline-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <div className="text-sm text-gray-500 text-center">Литры воды</div>
                  </div>
                  <div className="flex items-center gap-4 w-full max-w-2xl px-4">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full border-gray-300"
                        onClick={() => setWaterVolume(Math.max(0, Number((waterVolume - 0.1).toFixed(1))))}
                      >
                        <Minus className="h-4 w-4 text-gray-600" />
                      </Button>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={waterVolume}
                      onChange={(e) => setWaterVolume(Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(waterVolume / 50) * 100}%, #e5e7eb ${(waterVolume / 50) * 100}%, #e5e7eb 100%)`
                      }}
                    />
                    <div className="flex flex-col items-center flex-shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full border-gray-300"
                        onClick={() => setWaterVolume(Math.min(50, Number((waterVolume + 0.1).toFixed(1))))}
                      >
                        <Plus className="h-4 w-4 text-gray-600" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between w-full max-w-2xl px-4 text-xs text-gray-400">
                    <span className="w-8 text-center">0</span>
                    <span className="flex-1"></span>
                    <span className="w-8 text-center">50</span>
                  </div>

                </div>
              </div>
          </SectionCard>

        </div>
      </div>
      <BottomNavigation />
    </TooltipProvider>
  )
}
