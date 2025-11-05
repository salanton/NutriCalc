import { Settings, Gauge, Sun, Clock, Droplets, ChevronDown, Monitor, Palette, Languages, Building2 } from "lucide-react"
import { SectionCard } from "@/components/section-card"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useCalculatorWithSettings } from '@/hooks/useCalculatorWithSettings'
import { BottomNavigation } from "@/components/bottom-navigation"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Moon } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { dataService } from '@/lib/dataService'

export default function SettingsPage() {
  const {
    hideDescriptions,
    setHideDescriptions,
    isProMode,
    setIsProMode,
    isRussian,
    language,
    setLanguage,
    showAverageValues,
    setShowAverageValues,
  } = useCalculatorWithSettings()

  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Состояния для правил полива
  const [isApplicableRulesOpen, setIsApplicableRulesOpen] = useState(true)
  const [considerLightSchedule, setConsiderLightSchedule] = useState(false)
  const [adjustFirstLastWatering, setAdjustFirstLastWatering] = useState(false)
  const [compensatedDrippers, setCompensatedDrippers] = useState(false)

  // Состояния для видимости производителей
  const [isBrandsVisibilityOpen, setIsBrandsVisibilityOpen] = useState(true)
  const [enabledBrands, setEnabledBrands] = useState<Set<string>>(new Set())
  const brands = dataService.getBrands()

  // Загружаем данные из localStorage
  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem('nutricalc-watering')
      if (saved) {
        const wateringData = JSON.parse(saved)
        if (wateringData.considerLightSchedule !== undefined) setConsiderLightSchedule(wateringData.considerLightSchedule)
        if (wateringData.adjustFirstLastWatering !== undefined) setAdjustFirstLastWatering(wateringData.adjustFirstLastWatering)
        if (wateringData.compensatedDrippers !== undefined) setCompensatedDrippers(wateringData.compensatedDrippers)
        if (wateringData.isApplicableRulesOpen !== undefined) setIsApplicableRulesOpen(wateringData.isApplicableRulesOpen)
      }
      
      // Загружаем настройки видимости производителей
      const brandsVisibility = localStorage.getItem('nutricalc-brands-visibility')
      if (brandsVisibility) {
        const data = JSON.parse(brandsVisibility)
        if (data.enabledBrands) {
          setEnabledBrands(new Set(data.enabledBrands))
        }
        if (data.isBrandsVisibilityOpen !== undefined) {
          setIsBrandsVisibilityOpen(data.isBrandsVisibilityOpen)
        }
      } else {
        // По умолчанию все производители включены
        const allBrands = dataService.getBrands()
        setEnabledBrands(new Set(allBrands.map(b => b.code)))
      }
    } catch (error) {
      console.warn('Failed to load settings:', error)
      // По умолчанию все производители включены
      const allBrands = dataService.getBrands()
      setEnabledBrands(new Set(allBrands.map(b => b.code)))
    }
  }, [])

  // Сохраняем данные в localStorage
  useEffect(() => {
    if (!mounted) return
    try {
      const saved = localStorage.getItem('nutricalc-watering')
      const wateringData = saved ? JSON.parse(saved) : {}
      wateringData.considerLightSchedule = considerLightSchedule
      wateringData.adjustFirstLastWatering = adjustFirstLastWatering
      wateringData.compensatedDrippers = compensatedDrippers
      wateringData.isApplicableRulesOpen = isApplicableRulesOpen
      localStorage.setItem('nutricalc-watering', JSON.stringify(wateringData))
      
      // Сохраняем настройки видимости производителей
      localStorage.setItem('nutricalc-brands-visibility', JSON.stringify({
        enabledBrands: Array.from(enabledBrands),
        isBrandsVisibilityOpen
      }))
    } catch (error) {
      console.warn('Failed to save settings:', error)
    }
  }, [considerLightSchedule, adjustFirstLastWatering, compensatedDrippers, isApplicableRulesOpen, enabledBrands, isBrandsVisibilityOpen, mounted])

  const currentTheme = mounted ? (theme || 'system') : 'system'

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-8 pb-24 max-w-4xl">
        <header className="mb-8">
          <div className="pl-4">
            <h1 className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent text-left">
              {isRussian ? 'Настройки' : 'Settings'}
            </h1>
            {!hideDescriptions && (
              <p className="text-muted-foreground text-left">{isRussian ? 'Настройки приложения' : 'Application settings'}</p>
            )}
          </div>
        </header>

        <div className="space-y-6">
          {/* Основные настройки */}
          <SectionCard
            title={isRussian ? "Основные" : "Main"}
            description={isRussian ? "Основные параметры приложения" : "Main application parameters"}
            icon={Settings}
            iconColor="text-blue-500"
            hideDescriptions={hideDescriptions}
          >
            <div className="space-y-4">
              {/* Theme Toggle - тройной переключатель */}
              <div className="flex flex-col gap-2 py-2">
                <Label className="text-sm font-medium leading-none">
                  {isRussian ? 'Тема' : 'Theme'}
                </Label>
                <div className="flex gap-1 sm:gap-2">
                  <Button
                    variant={currentTheme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 min-w-0 ${currentTheme === 'light' ? 'bg-primary text-primary-foreground' : ''}`}
                    onClick={() => setTheme('light')}
                  >
                    <Sun className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm truncate">{isRussian ? 'Светлая' : 'Light'}</span>
                  </Button>
                  <Button
                    variant={currentTheme === 'system' ? 'default' : 'outline'}
                    size="sm"
                    className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 min-w-0 ${currentTheme === 'system' ? 'bg-primary text-primary-foreground' : ''}`}
                    onClick={() => setTheme('system')}
                  >
                    <Monitor className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm truncate">{isRussian ? 'Системная' : 'System'}</span>
                  </Button>
                  <Button
                    variant={currentTheme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 min-w-0 ${currentTheme === 'dark' ? 'bg-primary text-primary-foreground' : ''}`}
                    onClick={() => setTheme('dark')}
                  >
                    <Moon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm truncate">{isRussian ? 'Темная' : 'Dark'}</span>
                  </Button>
                </div>
              </div>

              {/* Language Toggle - тройной переключатель */}
              <div className="flex flex-col gap-2 py-2">
                <Label className="text-sm font-medium leading-none">
                  {isRussian ? 'Язык' : language === 'fr' ? 'Langue' : 'Language'}
                </Label>
                <div className="flex gap-1 sm:gap-2">
                  <Button
                    variant={language === 'en' ? 'default' : 'outline'}
                    size="sm"
                    className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 min-w-0 ${language === 'en' ? 'bg-primary text-primary-foreground' : ''}`}
                    onClick={() => setLanguage('en')}
                  >
                    <Languages className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">EN</span>
                  </Button>
                  <Button
                    variant={language === 'ru' ? 'default' : 'outline'}
                    size="sm"
                    className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 min-w-0 ${language === 'ru' ? 'bg-primary text-primary-foreground' : ''}`}
                    onClick={() => setLanguage('ru')}
                  >
                    <Languages className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">RU</span>
                  </Button>
                  <Button
                    variant={language === 'fr' ? 'default' : 'outline'}
                    size="sm"
                    className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 min-w-0 ${language === 'fr' ? 'bg-primary text-primary-foreground' : ''}`}
                    onClick={() => setLanguage('fr')}
                  >
                    <Languages className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">FR</span>
                  </Button>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Отображение */}
          <SectionCard
            title={isRussian ? "Отображение" : "Display"}
            description={isRussian ? "Параметры отображения" : "Display parameters"}
            icon={Palette}
            iconColor="text-purple-500"
            hideDescriptions={hideDescriptions}
          >
            <div className="space-y-4">
              {/* Average Values Toggle */}
              <div className="flex items-center justify-between py-2">
                <Label
                  htmlFor="average-values"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  {isRussian ? 'Усреднить значения' : 'Average Values'}
                </Label>
                <Switch
                  id="average-values"
                  checked={showAverageValues}
                  onCheckedChange={setShowAverageValues}
                />
              </div>

              {/* Pro Mode Toggle */}
              <div className="flex items-center justify-between py-2">
                <Label
                  htmlFor="pro-mode"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  {isRussian ? 'Про режим' : 'Pro Mode'}
                </Label>
                <Switch
                  id="pro-mode"
                  checked={isProMode}
                  onCheckedChange={setIsProMode}
                />
              </div>

              {/* Hide Descriptions Toggle */}
              <div className="flex items-center justify-between py-2">
                <Label
                  htmlFor="hide-descriptions"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  {isRussian ? 'Скрыть описания' : 'Hide Descriptions'}
                </Label>
                <Switch
                  id="hide-descriptions"
                  checked={hideDescriptions}
                  onCheckedChange={setHideDescriptions}
                />
              </div>
            </div>
          </SectionCard>

          {/* Brand Visibility */}
          <Collapsible open={isBrandsVisibilityOpen} onOpenChange={setIsBrandsVisibilityOpen}>
            <div className="border-2 rounded-xl transition-all duration-200 hover:shadow-lg">
              <CollapsibleTrigger className="w-full">
                <div className="flex flex-col space-y-1.5 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center justify-start gap-2 text-left text-xl font-semibold">
                      <Building2 className="h-5 w-5 flex-shrink-0 text-blue-500" />
                      <span>{isRussian ? 'Видимость производителей' : 'Brand Visibility'}</span>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isBrandsVisibilityOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {!hideDescriptions && (
                    <p className="text-left pl-7 text-sm text-muted-foreground">
                      {isRussian ? 'Включить или отключить отображение производителей в базе' : 'Enable or disable brand visibility in the database'}
                    </p>
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-6 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {brands.map((brand) => {
                      const isEnabled = enabledBrands.has(brand.code)
                      return (
                        <div
                          key={brand.code}
                          className={`unified-card unified-card-small ${isEnabled ? 'selected' : ''} ${hideDescriptions ? 'hide-descriptions' : ''} cursor-pointer`}
                          onClick={() => {
                            const newEnabled = new Set(enabledBrands)
                            if (isEnabled) {
                              newEnabled.delete(brand.code)
                            } else {
                              newEnabled.add(brand.code)
                            }
                            setEnabledBrands(newEnabled)
                          }}
                        >
                          <Building2 className="h-4 w-4 unified-card-icon text-blue-500" />
                          <div className="unified-card-content">
                            <h5 className="unified-card-label">{brand.name}</h5>
                            {!hideDescriptions && (
                              <span className="unified-card-description">
                                {isRussian ? (brand.description_ru || brand.description) : brand.description}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Applicable Rules */}
          <Collapsible open={isApplicableRulesOpen} onOpenChange={setIsApplicableRulesOpen}>
            <div className="border-2 rounded-xl transition-all duration-200 hover:shadow-lg">
              <CollapsibleTrigger className="w-full">
                <div className="flex flex-col space-y-1.5 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center justify-start gap-2 text-left text-xl font-semibold">
                      <Gauge className="h-5 w-5 flex-shrink-0 text-cyan-500" />
                      <span>{isRussian ? 'Применимые правила' : 'Applicable Rules'}</span>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isApplicableRulesOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {!hideDescriptions && (
                    <p className="text-left pl-7 text-sm text-muted-foreground">
                      {isRussian ? 'Настройки расписания поливов' : 'Watering schedule settings'}
                    </p>
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-6 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div
                      className={`unified-card unified-card-small ${considerLightSchedule ? 'selected' : ''} ${hideDescriptions ? 'hide-descriptions' : ''}`}
                      onClick={() => setConsiderLightSchedule(!considerLightSchedule)}
                    >
                      <Sun className="h-4 w-4 unified-card-icon text-orange-500" />
                      <div className="unified-card-content">
                        <h5 className="unified-card-label">{isRussian ? 'Учитывать световой режим' : 'Consider Light Schedule'}</h5>
                        {!hideDescriptions && (
                          <span className="unified-card-description">
                            {isRussian 
                              ? 'Первый полив в момент включения света, остальные распределяются по световому периоду'
                              : 'First watering at light on, others distributed across light period'
                            }
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      className={`unified-card unified-card-small ${adjustFirstLastWatering ? 'selected' : ''} ${hideDescriptions ? 'hide-descriptions' : ''}`}
                      onClick={() => setAdjustFirstLastWatering(!adjustFirstLastWatering)}
                    >
                      <Clock className="h-4 w-4 unified-card-icon text-blue-500" />
                      <div className="unified-card-content">
                        <h5 className="unified-card-label">{isRussian ? 'Первый и последний полив' : 'First and Last Watering'}</h5>
                        {!hideDescriptions && (
                          <span className="unified-card-description">
                            {isRussian 
                              ? 'Первый полив через 30 мин после включения, последний не позже чем за час до выключения'
                              : 'First watering 30 min after light on, last no later than 1 hour before light off'
                            }
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      className={`unified-card unified-card-small ${compensatedDrippers ? 'selected' : ''} ${hideDescriptions ? 'hide-descriptions' : ''}`}
                      onClick={() => setCompensatedDrippers(!compensatedDrippers)}
                    >
                      <Droplets className="h-4 w-4 unified-card-icon text-cyan-500" />
                      <div className="unified-card-content">
                        <h5 className="unified-card-label">{isRussian ? 'Компенсированные капельницы' : 'Compensated Drippers'}</h5>
                        {!hideDescriptions && (
                          <span className="unified-card-description">
                            {isRussian 
                              ? 'Использование компенсированных капельниц с заданным расходом'
                              : 'Using compensated drippers with specified flow rate'
                            }
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>
      </div>
      <BottomNavigation />
    </TooltipProvider>
  )
}

