import { useState, useEffect } from "react"
import { Gauge, Droplet, Droplets, Sun, Leaf, Moon, Sunrise, Clock, Calendar } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { SectionCard } from "@/components/section-card"
import { useCalculatorWithSettings } from '@/hooks/useCalculatorWithSettings'

type WateringMethod = 'manual' | 'drip' | 'hydroponic'

export default function WateringPage() {
  const { basePh, setBasePh, baseEc, setBaseEc, baseTemperature, setBaseTemperature, isRussian, hideDescriptions, isProMode } = useCalculatorWithSettings()
  
  // Значения по умолчанию
  const DEFAULT_VALUES = {
    wateringMethod: 'manual' as WateringMethod,
    lightHours: 18,
    waterPerMinute: 2.0,
    plantCount: 1,
    wateringsPerDay: 1,
    dayStartTime: '06:00',
    wateringDuration: 1.0,
    considerLightSchedule: true,
    adjustFirstLastWatering: true,
    compensatedDrippers: false,
    dripperValue: 4,
    dripperCount: 4,
    systemVolume: 50,
    solutionChangeFrequency: 7,
    manualWateringFrequency: 3
  }

  const [wateringMethod, setWateringMethod] = useState<WateringMethod>(DEFAULT_VALUES.wateringMethod)
  const [lightHours, setLightHours] = useState(DEFAULT_VALUES.lightHours)
  const [waterPerMinute, setWaterPerMinute] = useState(DEFAULT_VALUES.waterPerMinute) // литры в минуту
  const [plantCount, setPlantCount] = useState(DEFAULT_VALUES.plantCount)
  const [wateringsPerDay, setWateringsPerDay] = useState(DEFAULT_VALUES.wateringsPerDay)
  const [dayStartTime, setDayStartTime] = useState(DEFAULT_VALUES.dayStartTime)
  const [wateringDuration, setWateringDuration] = useState(DEFAULT_VALUES.wateringDuration) // минуты (0.5 = 30 сек, 1 = 1 мин, ..., 10 = 10 мин)
  const [considerLightSchedule, setConsiderLightSchedule] = useState(DEFAULT_VALUES.considerLightSchedule) // Учитывать световой режим
  const [adjustFirstLastWatering, setAdjustFirstLastWatering] = useState(DEFAULT_VALUES.adjustFirstLastWatering) // Первый и последний полив с корректировкой
  const [compensatedDrippers, setCompensatedDrippers] = useState(DEFAULT_VALUES.compensatedDrippers) // Компенсированные капельницы
  const [dripperValue, setDripperValue] = useState(DEFAULT_VALUES.dripperValue) // Значение капельницы (л/час), от 1 до 20
  const [dripperCount, setDripperCount] = useState(DEFAULT_VALUES.dripperCount) // Количество капельниц, от 1 до 20
  const [systemVolume, setSystemVolume] = useState(DEFAULT_VALUES.systemVolume) // Объем системы для гидропоники (л), от 10 до 100
  const [solutionChangeFrequency, setSolutionChangeFrequency] = useState(DEFAULT_VALUES.solutionChangeFrequency) // Частота замены раствора (дней), от 1 до 30
  const [manualWateringFrequency, setManualWateringFrequency] = useState(DEFAULT_VALUES.manualWateringFrequency) // Частота поливов для ручного полива (дней), от 1 до 30
  const [isLoaded, setIsLoaded] = useState(false)

  // Загружаем данные из localStorage при монтировании
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nutricalc-watering')
      if (saved) {
        const wateringData = JSON.parse(saved)
        // Восстанавливаем все значения из сохраненных данных
        if (wateringData.wateringMethod) setWateringMethod(wateringData.wateringMethod)
        if (wateringData.lightHours !== undefined) setLightHours(wateringData.lightHours)
        if (wateringData.waterPerMinute !== undefined) setWaterPerMinute(wateringData.waterPerMinute)
        if (wateringData.plantCount !== undefined) setPlantCount(wateringData.plantCount)
        if (wateringData.wateringsPerDay !== undefined) setWateringsPerDay(wateringData.wateringsPerDay)
        if (wateringData.dayStartTime) setDayStartTime(wateringData.dayStartTime)
        if (wateringData.wateringDuration !== undefined) setWateringDuration(wateringData.wateringDuration)
        if (wateringData.considerLightSchedule !== undefined) setConsiderLightSchedule(wateringData.considerLightSchedule)
        if (wateringData.adjustFirstLastWatering !== undefined) setAdjustFirstLastWatering(wateringData.adjustFirstLastWatering)
        if (wateringData.compensatedDrippers !== undefined) setCompensatedDrippers(wateringData.compensatedDrippers)
        if (wateringData.dripperValue !== undefined) setDripperValue(wateringData.dripperValue)
        if (wateringData.dripperCount !== undefined) setDripperCount(wateringData.dripperCount)
        if (wateringData.systemVolume !== undefined) setSystemVolume(wateringData.systemVolume)
        if (wateringData.solutionChangeFrequency !== undefined) setSolutionChangeFrequency(wateringData.solutionChangeFrequency)
        if (wateringData.manualWateringFrequency !== undefined) setManualWateringFrequency(wateringData.manualWateringFrequency)
      }
    } catch (error) {
      console.warn('Failed to load watering data from localStorage:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Calculate watering schedule
  const calculateWateringSchedule = () => {
    if (wateringMethod === 'hydroponic') {
      // For hydroponics, show dates for solution changes for the next month
      const schedule: Array<{ date: string }> = []
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Установим начало дня для точности
      const endDate = new Date(today)
      endDate.setMonth(endDate.getMonth() + 1)
      
      // Generate dates starting from today
      let currentDate = new Date(today)
      while (currentDate <= endDate) {
        const day = String(currentDate.getDate()).padStart(2, '0')
        const month = String(currentDate.getMonth() + 1).padStart(2, '0')
        const year = currentDate.getFullYear()
        const dateString = isRussian ? `${day}.${month}.${year}` : `${month}/${day}/${year}`
        schedule.push({
          date: dateString
        })
        // Add frequency days
        currentDate.setDate(currentDate.getDate() + solutionChangeFrequency)
      }
      
      return schedule
    }

    if (wateringMethod === 'manual') {
      // For manual watering, show dates for the next month
      const schedule: Array<{ date: string }> = []
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Установим начало дня для точности
      const endDate = new Date(today)
      endDate.setMonth(endDate.getMonth() + 1)
      
      // Generate dates starting from today
      let currentDate = new Date(today)
      while (currentDate <= endDate) {
        const day = String(currentDate.getDate()).padStart(2, '0')
        const month = String(currentDate.getMonth() + 1).padStart(2, '0')
        const year = currentDate.getFullYear()
        const dateString = isRussian ? `${day}.${month}.${year}` : `${month}/${day}/${year}`
        schedule.push({
          date: dateString
        })
        // Add frequency days
        currentDate.setDate(currentDate.getDate() + manualWateringFrequency)
      }
      
      return schedule
    }

    const schedule: Array<{ time: string; totalWater: number; waterPerPlant: number; totalMinutes: number }> = []
    const [startHour, startMinute] = dayStartTime.split(':').map(Number)
    
    // Calculate water per watering
    // Если включены компенсированные капельницы, рассчитываем из л/час
    let effectiveWaterPerMinute = waterPerMinute
    if (compensatedDrippers) {
      // dripperValue в л/час, переводим в л/мин: (л/час) / 60 = л/мин для одной капельницы
      // Умножаем на количество капельниц
      effectiveWaterPerMinute = (dripperValue / 60) * dripperCount
    }
    const totalWaterPerWatering = effectiveWaterPerMinute * wateringDuration // литров за один полив
    const waterPerPlant = totalWaterPerWatering / plantCount // литров на одно растение
    
    if (considerLightSchedule) {
      // Распределяем поливы равномерно по световому периоду
      const lightHoursInMinutes = lightHours * 60
      let firstWateringTime: number
      let lastWateringTime: number
      let intervalMinutes: number
      
      if (adjustFirstLastWatering) {
        // Первый полив через 30 минут после включения света
        firstWateringTime = startHour * 60 + startMinute + 30
        // Последний полив не позже чем за час до выключения света
        // Время выключения света = startHour * 60 + startMinute + lightHoursInMinutes
        // Последний полив должен быть <= startHour * 60 + startMinute + lightHoursInMinutes - 60
        lastWateringTime = startHour * 60 + startMinute + lightHoursInMinutes - 60
        
        // Распределяем поливы между первым и последним
        if (wateringsPerDay === 1) {
          // Если только один полив, делаем его в момент первого полива
          intervalMinutes = 0
        } else {
          // Интервал между поливами в доступном временном окне
          const availableTime = lastWateringTime - firstWateringTime
          intervalMinutes = availableTime / (wateringsPerDay - 1)
        }
      } else {
        // Первый полив в момент включения света (dayStartTime)
        firstWateringTime = startHour * 60 + startMinute
        intervalMinutes = wateringsPerDay > 1 ? lightHoursInMinutes / (wateringsPerDay - 1) : 0
      }
      
      for (let i = 0; i < wateringsPerDay; i++) {
        const totalMinutes = Math.round(firstWateringTime + (i * intervalMinutes))
        const hours = Math.floor(totalMinutes / 60) % 24
        const minutes = totalMinutes % 60
        const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
        
        schedule.push({
          time: timeString,
          totalWater: totalWaterPerWatering,
          waterPerPlant: waterPerPlant,
          totalMinutes: totalMinutes // Сохраняем для корректной сортировки
        })
      }
    } else {
      // Распределяем поливы равномерно по всему дню (24 часа)
      const intervalMinutes = (24 * 60) / wateringsPerDay
      
      // Generate schedule for one day
      for (let i = 0; i < wateringsPerDay; i++) {
        const totalMinutes = Math.round(startHour * 60 + startMinute + (i * intervalMinutes))
        const hours = Math.floor(totalMinutes / 60) % 24
        const minutes = totalMinutes % 60
        const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
        
        schedule.push({
          time: timeString,
          totalWater: totalWaterPerWatering,
          waterPerPlant: waterPerPlant,
          totalMinutes: totalMinutes // Сохраняем для корректной сортировки
        })
      }
    }
    
    // Сортируем по порядку добавления (от первого полива к последнему) по totalMinutes
    return schedule.sort((a, b) => a.totalMinutes - b.totalMinutes)
  }

  const wateringSchedule = calculateWateringSchedule()

  // Сохраняем данные полива в localStorage для использования на других страницах
  // Сохраняем только после загрузки данных, чтобы не перезаписать загруженные значения
  useEffect(() => {
    if (!isLoaded) return // Не сохраняем до загрузки данных
    
    try {
      const wateringData = {
        wateringMethod,
        lightHours,
        waterPerMinute,
        plantCount,
        wateringsPerDay,
        dayStartTime,
        wateringDuration,
        considerLightSchedule,
        adjustFirstLastWatering,
        compensatedDrippers,
        dripperValue,
        dripperCount,
        systemVolume,
        solutionChangeFrequency,
        manualWateringFrequency
      }
      localStorage.setItem('nutricalc-watering', JSON.stringify(wateringData))
    } catch (e) {
      // Игнорируем ошибки сохранения
    }
  }, [
    isLoaded,
    wateringMethod,
    lightHours,
    waterPerMinute,
    plantCount,
    wateringsPerDay,
    dayStartTime,
    wateringDuration,
    considerLightSchedule,
    adjustFirstLastWatering,
    compensatedDrippers,
    dripperValue,
    dripperCount,
    systemVolume,
    solutionChangeFrequency,
    manualWateringFrequency
  ])

  // Adjust waterings per day based on watering method
  useEffect(() => {
    if (wateringMethod === 'manual') {
      if (wateringsPerDay > 5) {
        setWateringsPerDay(5);
      }
    } else if (wateringMethod === 'drip') {
      if (wateringsPerDay > 10) {
        setWateringsPerDay(10);
      }
    }
  }, [wateringMethod])
  
  return (
    <div className="container mx-auto px-4 py-8 pb-24 max-w-4xl">
      <header className="mb-8">
        <div className="pl-4">
          <h1 className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent text-left">
            NutriCalc
          </h1>
          <p className="text-muted-foreground text-left">Калькулятор питательных веществ</p>
        </div>
      </header>

      <div className="space-y-6">
        {isProMode && (
          <SectionCard
            title={isRussian ? 'Базовые параметры воды' : 'Base Water Parameters'}
            description={isRussian ? 'Параметры воды из вашего источника' : 'Parameters from your water source'}
            icon={Gauge}
            hideDescriptions={hideDescriptions}
          >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
            {/* pH Input */}
            <div className="flex flex-col items-center justify-center gap-1.5">
              <div className="relative w-auto">
                <div className="text-xl font-bold text-purple-600 w-full h-[36px] text-center flex items-center justify-center">
                  <input
                    type="text"
                    value={basePh.toFixed(1)}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || !isNaN(Number(value))) {
                        const numValue = value === '' ? 0 : Number(value);
                        if (numValue >= 4 && numValue <= 9) {
                          setBasePh(Number(numValue.toFixed(1)));
                        }
                      }
                    }}
                    className="w-14 text-xl font-bold text-purple-600 bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 w-full px-2">
                <input
                  type="range"
                  min="4"
                  max="9"
                  step="0.1"
                  value={basePh}
                  onChange={(e) => setBasePh(Number(Number(e.target.value).toFixed(1)))}
                  className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${((basePh - 4) / 5) * 100}%, #e5e7eb ${((basePh - 4) / 5) * 100}%, #e5e7eb 100%)`
                  }}
                />
              </div>
              <div className="text-xs text-muted-foreground">{isRussian ? 'pH' : 'pH'}</div>
            </div>

            {/* EC Input */}
            <div className="flex flex-col items-center justify-center gap-1.5">
              <div className="relative w-auto">
                <div className="text-xl font-bold text-cyan-600 w-full h-[36px] text-center flex items-center justify-center">
                  <input
                    type="text"
                    value={baseEc.toFixed(1)}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || !isNaN(Number(value))) {
                        const numValue = value === '' ? 0 : Number(value);
                        if (numValue >= 0.1 && numValue <= 1.5) {
                          setBaseEc(Number(numValue.toFixed(1)));
                        }
                      }
                    }}
                    className="w-14 text-xl font-bold text-cyan-600 bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 w-full px-2">
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.1"
                  value={baseEc}
                  onChange={(e) => setBaseEc(Number(Number(e.target.value).toFixed(1)))}
                  className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${((baseEc - 0.1) / 1.4) * 100}%, #e5e7eb ${((baseEc - 0.1) / 1.4) * 100}%, #e5e7eb 100%)`
                  }}
                />
              </div>
              <div className="text-xs text-muted-foreground">{isRussian ? 'EC' : 'EC'}</div>
            </div>

            {/* Temperature Input */}
            <div className="flex flex-col items-center justify-center gap-1.5">
              <div className="relative w-auto">
                <div className="text-xl font-bold text-red-500 w-full h-[36px] text-center flex items-center justify-center gap-0">
                  <input
                    type="text"
                    value={baseTemperature}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || !isNaN(Number(value))) {
                        const numValue = value === '' ? 0 : Number(value);
                        if (numValue >= 15 && numValue <= 35) {
                          setBaseTemperature(Math.round(numValue));
                        }
                      }
                    }}
                    className="w-10 text-xl font-bold text-red-500 bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-xl font-bold text-red-500 -ml-2">°C</span>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full px-2">
                <input
                  type="range"
                  min="15"
                  max="35"
                  step="1"
                  value={baseTemperature}
                  onChange={(e) => setBaseTemperature(Number(e.target.value))}
                  className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${((baseTemperature - 15) / 20) * 100}%, #e5e7eb ${((baseTemperature - 15) / 20) * 100}%, #e5e7eb 100%)`
                  }}
                />
              </div>
              <div className="text-xs text-muted-foreground">{isRussian ? 'Температура' : 'Temperature'}</div>
            </div>
          </div>
        </SectionCard>
        )}

        {/* All blocks from Mode to Waterings Per Day - скрываем для гидропоники и ручного полива */}
        {wateringMethod !== 'hydroponic' && wateringMethod !== 'manual' && (
          <div className={`grid grid-cols-2 ${compensatedDrippers ? 'md:grid-cols-3' : 'md:grid-cols-3'} gap-4`}>
            {/* Light Schedule */}
            <SectionCard
              title={isRussian ? 'Режим' : 'Mode'}
              description={isRussian ? 'Световой режим' : 'Light schedule'}
              icon={Sun}
              iconColor="text-orange-500"
              hideDescriptions={hideDescriptions}
              hideDescriptionOnMobile={true}
            >
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center justify-center gap-2 w-full">
                {/* Над слайдером - иконка солнца и часы света (для мобильной версии) */}
                <div className="w-full -mx-2 px-2 md:hidden">
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center justify-items-center gap-1">
                    <div className="flex justify-end items-center w-full">
                      <Sun className="h-5 w-5 text-orange-500" />
                    </div>
                    <input
                      type="text"
                      value={lightHours}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || !isNaN(Number(value))) {
                          const numValue = value === '' ? 0 : Number(value);
                          if (numValue >= 1 && numValue <= 24) {
                            setLightHours(Math.round(Math.max(1, Math.min(24, numValue))));
                          }
                        }
                      }}
                      className="w-12 text-2xl font-bold text-orange-600 bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <div className="w-full"></div>
                  </div>
                </div>
                {/* Десктопная версия - все в одной строке */}
                <div className="relative w-40 hidden md:block">
                  <div className="text-2xl font-bold w-full h-[48px] text-center flex items-center justify-center gap-2">
                    <Sun className="h-5 w-5 text-orange-500" />
                    <input
                      type="text"
                      value={lightHours}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || !isNaN(Number(value))) {
                          const numValue = value === '' ? 0 : Number(value);
                          if (numValue >= 1 && numValue <= 24) {
                            setLightHours(Math.round(Math.max(1, Math.min(24, numValue))));
                          }
                        }
                      }}
                      className="w-12 text-2xl font-bold text-orange-600 bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-gray-400">-</span>
                    <span className="text-2xl font-bold text-blue-500 w-12">{24 - lightHours}</span>
                    <Moon className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
                <div className="flex items-center w-full -mx-2 px-2">
                  <input
                    type="range"
                    min="1"
                    max="24"
                    step="1"
                    value={lightHours}
                    onChange={(e) => setLightHours(Number(e.target.value))}
                    className="flex-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #f97316 0%, #f97316 ${((lightHours - 1) / 23) * 100}%, #3b82f6 ${((lightHours - 1) / 23) * 100}%, #3b82f6 100%)`
                    }}
                  />
                </div>
                {/* Под слайдером - иконка месяца и часы без света (для мобильной версии) */}
                <div className="w-full -mx-2 px-2 md:hidden">
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center justify-items-center gap-2">
                    <div className="w-full"></div>
                    <span className="text-2xl font-bold text-blue-500">{24 - lightHours}</span>
                    <div className="flex justify-start items-center w-full pl-1">
                      <Moon className="h-5 w-5 text-blue-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Day Start Time */}
          <SectionCard
            title={isRussian ? 'Начало дня' : 'Day Start'}
            description={isRussian ? 'Время включения лампы' : 'Light on time'}
            icon={Sunrise}
            iconColor="text-yellow-500"
            hideDescriptions={hideDescriptions}
            hideDescriptionOnMobile={true}
          >
            <div className="flex flex-col items-center justify-center gap-2 py-4">
              <div className="flex items-center justify-center gap-2">
                <input
                  type="time"
                  value={dayStartTime}
                  onChange={(e) => setDayStartTime(e.target.value)}
                  className="text-lg font-bold w-32 h-10 text-center bg-transparent border border-input rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
            </div>
          </SectionCard>

          {/* Plant Count */}
          <SectionCard
            title={isRussian ? 'Растения' : 'Plants'}
            description={isRussian ? 'Число растений в системе' : 'Number of plants in the system'}
            icon={Leaf}
            iconColor="text-green-500"
            hideDescriptions={hideDescriptions}
            hideDescriptionOnMobile={true}
          >
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center justify-center gap-2 w-full">
                <div className="relative w-24">
                  <div className="text-2xl font-bold text-green-600 w-full h-[48px] text-center flex items-center justify-center">
                    <input
                      type="text"
                      value={plantCount}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || !isNaN(Number(value))) {
                          const numValue = value === '' ? 0 : Number(value);
                          if (numValue >= 1 && numValue <= 10) {
                            setPlantCount(Math.round(numValue));
                          }
                        }
                      }}
                      className="w-12 text-2xl font-bold text-green-600 bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-2xl font-bold text-green-600 -ml-2">x</span>
                  </div>
                </div>
                <div className="flex items-center w-full -mx-2 px-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={plantCount}
                    onChange={(e) => setPlantCount(Number(e.target.value))}
                    className="flex-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #22c55e 0%, #22c55e ${((plantCount - 1) / 9) * 100}%, #e5e7eb ${((plantCount - 1) / 9) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                </div>
              </div>
            </div>
            </SectionCard>

            {/* Volume/Dripper Value and Dripper Count/Waterings Per Day */}
            {/* Water Per Minute or Dripper Value */}
            {!compensatedDrippers ? (
            <SectionCard
              title={isRussian ? 'Объем' : 'Volume'}
              description={isRussian ? 'Расход воды при поливе' : 'Water consumption during watering'}
              icon={Droplet}
              iconColor="text-blue-500"
              hideDescriptions={hideDescriptions}
            >
              <div className="flex items-center justify-center">
                <div className="flex flex-col items-center justify-center gap-2 w-full">
                  <div className="relative w-auto">
                    <div className="text-2xl font-bold text-blue-600 w-full h-[48px] text-center flex items-center justify-center gap-0">
                      <input
                        type="text"
                        value={waterPerMinute.toFixed(1)}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || !isNaN(Number(value))) {
                            const numValue = value === '' ? 0 : Number(value);
                            if (numValue >= 0.1 && numValue <= 10) {
                              setWaterPerMinute(Number(numValue.toFixed(1)));
                            }
                          }
                        }}
                        className="w-16 text-2xl font-bold text-blue-600 bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-2xl font-bold text-blue-600 -ml-2">л/мин</span>
                    </div>
                  </div>
                  <div className="flex items-center w-full -mx-2 px-2">
                    <input
                      type="range"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={waterPerMinute}
                      onChange={(e) => setWaterPerMinute(Number(Number(e.target.value).toFixed(1)))}
                      className="flex-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((waterPerMinute - 0.1) / 9.9) * 100}%, #e5e7eb ${((waterPerMinute - 0.1) / 9.9) * 100}%, #e5e7eb 100%)`
                      }}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>
          ) : (
            <>
              <SectionCard
                title={
                  <>
                    <span className="hidden md:inline">{isRussian ? 'Значение капельницы' : 'Dripper Value'}</span>
                    <span className="md:hidden text-sm sm:text-base">{isRussian ? 'Капельница' : 'Dripper'}</span>
                  </>
                }
                description={isRussian ? 'Расход одной капельницы' : 'Flow rate per dripper'}
                icon={Gauge}
                iconColor="text-blue-500"
                hideDescriptions={hideDescriptions}
                hideDescriptionOnMobile={true}
              >
                <div className="flex items-center justify-center">
                  <div className="flex flex-col items-center justify-center gap-2 w-full">
                    <div className="relative w-auto">
                      <div className="text-xl sm:text-2xl font-bold text-blue-600 w-full h-[48px] text-center flex items-center justify-center gap-0 flex-nowrap">
                        <input
                          type="text"
                          value={dripperValue}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || !isNaN(Number(value))) {
                              const numValue = value === '' ? 0 : Number(value);
                              if (numValue >= 1 && numValue <= 20) {
                                setDripperValue(Math.round(numValue));
                              }
                            }
                          }}
                          className="w-12 sm:w-16 text-xl sm:text-2xl font-bold text-blue-600 bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-shrink-0"
                        />
                        <span className="text-xl sm:text-2xl font-bold text-blue-600 -ml-1 sm:-ml-2 whitespace-nowrap flex-shrink-0">л/час</span>
                      </div>
                    </div>
                    <div className="flex items-center w-full -mx-2 px-2">
                      <input
                        type="range"
                        min="1"
                        max="20"
                        step="1"
                        value={dripperValue}
                        onChange={(e) => setDripperValue(Number(e.target.value))}
                        className="flex-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((dripperValue - 1) / 19) * 100}%, #e5e7eb ${((dripperValue - 1) / 19) * 100}%, #e5e7eb 100%)`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </SectionCard>
              <SectionCard
                title={
                  <>
                    <span className="hidden md:inline">{isRussian ? 'Количество капельниц' : 'Dripper Count'}</span>
                    <span className="md:hidden">{isRussian ? 'Кол-во' : 'Count'}</span>
                  </>
                }
                description={isRussian ? 'Число капельниц в системе' : 'Number of drippers in system'}
                icon={Droplets}
                iconColor="text-cyan-500"
                hideDescriptions={hideDescriptions}
                hideDescriptionOnMobile={true}
              >
                <div className="flex items-center justify-center">
                  <div className="flex flex-col items-center justify-center gap-2 w-full">
                    <div className="relative w-24">
                      <div className="text-2xl font-bold text-cyan-600 w-full h-[48px] text-center flex items-center justify-center">
                        <input
                          type="text"
                          value={dripperCount}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || !isNaN(Number(value))) {
                              const numValue = value === '' ? 0 : Number(value);
                              if (numValue >= 1 && numValue <= 20) {
                                setDripperCount(Math.round(numValue));
                              }
                            }
                          }}
                          className="w-12 text-2xl font-bold text-cyan-600 bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-2xl font-bold text-cyan-600 -ml-2">x</span>
                      </div>
                    </div>
                    <div className="flex items-center w-full -mx-2 px-2">
                      <input
                        type="range"
                        min="1"
                        max="20"
                        step="1"
                        value={dripperCount}
                        onChange={(e) => setDripperCount(Number(e.target.value))}
                        className="flex-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${((dripperCount - 1) / 19) * 100}%, #e5e7eb ${((dripperCount - 1) / 19) * 100}%, #e5e7eb 100%)`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </SectionCard>
            </>
          )}

            {/* Waterings Per Day */}
            <SectionCard
              title={
                <>
                  <span className="hidden md:inline">{isRussian ? 'Поливов в день' : 'Waterings Per Day'}</span>
                  <span className="md:hidden">{isRussian ? 'Поливов' : 'Waterings'}</span>
                </>
              }
              description={isRussian ? 'Частота полива в течение дня' : 'Watering frequency during the day'}
              icon={Clock}
              iconColor="text-purple-500"
              hideDescriptions={hideDescriptions}
              hideDescriptionOnMobile={true}
            >
              <div className="flex items-center justify-center">
                <div className="flex flex-col items-center justify-center gap-2 w-full">
                  <div className="relative w-24">
                    <div className="text-2xl font-bold text-purple-600 w-full h-[48px] text-center flex items-center justify-center gap-0">
                      <input
                        type="text"
                        value={wateringsPerDay}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || !isNaN(Number(value))) {
                            const numValue = value === '' ? 0 : Number(value);
                            const maxWaterings = wateringMethod === 'drip' ? 10 : 24;
                            if (numValue >= 1 && numValue <= maxWaterings) {
                              setWateringsPerDay(Math.round(numValue));
                            }
                          }
                        }}
                        className="w-12 text-2xl font-bold text-purple-600 bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-2xl font-bold text-purple-600 -ml-2">x</span>
                    </div>
                  </div>
                  <div className="flex items-center w-full -mx-2 px-2">
                    <input
                      type="range"
                      min="1"
                      max={wateringMethod === 'drip' ? 10 : 24}
                      step="1"
                      value={wateringsPerDay}
                      onChange={(e) => setWateringsPerDay(Number(e.target.value))}
                      className="flex-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${((wateringsPerDay - 1) / (wateringMethod === 'drip' ? 9 : 23)) * 100}%, #e5e7eb ${((wateringsPerDay - 1) / (wateringMethod === 'drip' ? 9 : 23)) * 100}%, #e5e7eb 100%)`
                      }}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {/* Watering Duration - для капельного полива, Frequency - для ручного и гидропоники */}
        {wateringMethod === 'manual' ? (
          <SectionCard
            title={isRussian ? 'Частота поливов' : 'Watering Frequency'}
            description={isRussian ? 'Как часто поливать растения' : 'How often to water plants'}
            icon={Clock}
            iconColor="text-indigo-500"
            hideDescriptions={hideDescriptions}
          >
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center justify-center gap-2 w-full">
                <div className="relative w-auto">
                  <div className="text-2xl font-bold text-indigo-600 w-full h-[48px] text-center flex items-center justify-center gap-0">
                    {isRussian ? (
                      <>
                        <span className="text-2xl font-bold text-indigo-600">Каждые</span>
                        <input
                          type="text"
                          value={manualWateringFrequency}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || !isNaN(Number(value))) {
                              const numValue = value === '' ? 0 : Number(value);
                              if (numValue >= 1 && numValue <= 30) {
                                setManualWateringFrequency(Math.round(numValue));
                              }
                            }
                          }}
                          className="w-12 text-2xl font-bold text-indigo-600 bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-2xl font-bold text-indigo-600 -ml-2">
                          {manualWateringFrequency === 1 
                            ? 'день' 
                            : manualWateringFrequency % 10 === 1 && manualWateringFrequency !== 11 
                              ? 'день' 
                              : manualWateringFrequency % 10 >= 2 && manualWateringFrequency % 10 <= 4 && (manualWateringFrequency < 10 || manualWateringFrequency > 20)
                                ? 'дня' 
                                : 'дней'
                          }
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl font-bold text-indigo-600">Every</span>
                        <input
                          type="text"
                          value={manualWateringFrequency}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || !isNaN(Number(value))) {
                              const numValue = value === '' ? 0 : Number(value);
                              if (numValue >= 1 && numValue <= 30) {
                                setManualWateringFrequency(Math.round(numValue));
                              }
                            }
                          }}
                          className="w-12 text-2xl font-bold text-indigo-600 bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-2xl font-bold text-indigo-600 -ml-2">
                          {manualWateringFrequency === 1 ? 'day' : 'days'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center w-full -mx-2 px-2">
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={manualWateringFrequency}
                    onChange={(e) => setManualWateringFrequency(Number(e.target.value))}
                    className="flex-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${((manualWateringFrequency - 1) / 29) * 100}%, #e5e7eb ${((manualWateringFrequency - 1) / 29) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                </div>
              </div>
            </div>
          </SectionCard>
        ) : wateringMethod !== 'hydroponic' ? (
          <SectionCard
            title={isRussian ? 'Длительность одного полива' : 'Watering Duration'}
            description={isRussian ? 'Время одного цикла полива' : 'Duration of one watering cycle'}
            icon={Clock}
            iconColor="text-indigo-500"
            hideDescriptions={hideDescriptions}
          >
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center justify-center gap-2 w-full">
                <div className="relative w-auto">
                  <div className="text-2xl font-bold text-indigo-600 w-full h-[48px] text-center flex items-center justify-center gap-0">
                    <input
                      type="text"
                      value={wateringDuration % 1 === 0 ? wateringDuration.toFixed(0) : wateringDuration.toFixed(1)}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || !isNaN(Number(value))) {
                          const numValue = value === '' ? 0 : Number(value);
                          // Округляем до ближайшего 0.5
                          const rounded = Math.round(numValue * 2) / 2;
                          if (rounded >= 0.5 && rounded <= 10) {
                            setWateringDuration(rounded);
                          }
                        }
                      }}
                      className="w-16 text-2xl font-bold text-indigo-600 bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-2xl font-bold text-indigo-600 -ml-2">мин</span>
                  </div>
                </div>
                <div className="flex items-center w-full -mx-2 px-2">
                  <input
                    type="range"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={wateringDuration}
                    onChange={(e) => setWateringDuration(Number(Number(e.target.value).toFixed(1)))}
                    className="flex-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${((wateringDuration - 0.5) / 9.5) * 100}%, #e5e7eb ${((wateringDuration - 0.5) / 9.5) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                </div>
              </div>
            </div>
          </SectionCard>
        ) : (
          <SectionCard
            title={isRussian ? 'Частота контроля раствора' : 'Solution Control Frequency'}
            description={isRussian ? 'Как часто контролировать питательный раствор' : 'How often to control nutrient solution'}
            icon={Clock}
            iconColor="text-indigo-500"
            hideDescriptions={hideDescriptions}
          >
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center justify-center gap-2 w-full">
                <div className="relative w-auto">
                  <div className="text-2xl font-bold text-indigo-600 w-full h-[48px] text-center flex items-center justify-center gap-0">
                    {isRussian ? (
                      <>
                        <span className="text-2xl font-bold text-indigo-600">Каждые</span>
                        <input
                          type="text"
                          value={solutionChangeFrequency}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || !isNaN(Number(value))) {
                              const numValue = value === '' ? 0 : Number(value);
                              if (numValue >= 1 && numValue <= 30) {
                                setSolutionChangeFrequency(Math.round(numValue));
                              }
                            }
                          }}
                          className="w-12 text-2xl font-bold text-indigo-600 bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-2xl font-bold text-indigo-600 -ml-2">
                          {solutionChangeFrequency === 1 
                            ? 'день' 
                            : solutionChangeFrequency % 10 === 1 && solutionChangeFrequency !== 11 
                              ? 'день' 
                              : solutionChangeFrequency % 10 >= 2 && solutionChangeFrequency % 10 <= 4 && (solutionChangeFrequency < 10 || solutionChangeFrequency > 20)
                                ? 'дня' 
                                : 'дней'
                          }
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl font-bold text-indigo-600">Every</span>
                        <input
                          type="text"
                          value={solutionChangeFrequency}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || !isNaN(Number(value))) {
                              const numValue = value === '' ? 0 : Number(value);
                              if (numValue >= 1 && numValue <= 30) {
                                setSolutionChangeFrequency(Math.round(numValue));
                              }
                            }
                          }}
                          className="w-12 text-2xl font-bold text-indigo-600 bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-2xl font-bold text-indigo-600 -ml-2">
                          {solutionChangeFrequency === 1 ? 'day' : 'days'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center w-full -mx-2 px-2">
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={solutionChangeFrequency}
                    onChange={(e) => setSolutionChangeFrequency(Number(e.target.value))}
                    className="flex-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${((solutionChangeFrequency - 1) / 29) * 100}%, #e5e7eb ${((solutionChangeFrequency - 1) / 29) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                </div>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Watering Schedule */}
        {wateringSchedule.length > 0 && (
          <SectionCard
            title={isRussian 
              ? (wateringMethod === 'hydroponic' ? 'Расписание контроля' : 'Расписание поливов')
              : (wateringMethod === 'hydroponic' ? 'Control Schedule' : 'Watering Schedule')
            }
            description={isRussian 
              ? (wateringMethod === 'hydroponic' ? 'График контроля раствора на месяц' : wateringMethod === 'manual' ? 'График поливов на месяц' : 'График поливов на день')
              : (wateringMethod === 'hydroponic' ? 'Monthly solution control schedule' : wateringMethod === 'manual' ? 'Monthly watering schedule' : 'Daily watering schedule')
            }
            icon={Calendar}
            iconColor="text-green-500"
            hideDescriptions={hideDescriptions}
          >
            <div className="space-y-2">
              {(wateringMethod === 'hydroponic' || wateringMethod === 'manual') ? (
                <div className="grid grid-cols-3 gap-2">
                  {wateringSchedule.map((item, idx) => (
                    <div key={idx} className="rounded-md border p-2 bg-background text-center">
                      <span className="text-sm font-medium">
                        {'date' in item ? item.date : item.time}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-2">
                  <div className="grid grid-cols-3 gap-2 rounded-md border p-2 bg-muted/50 text-center">
                    <span className="text-sm font-semibold">{isRussian ? 'Время' : 'Time'}</span>
                    <span className="text-sm font-semibold">{isRussian ? 'Всего воды' : 'Total Water'}</span>
                    <span className="text-sm font-semibold">{isRussian ? 'На растение' : 'Per Plant'}</span>
                  </div>
                  {wateringSchedule.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-2 rounded-md border p-2 bg-background text-center">
                      <span className="text-sm font-medium">
                        {'date' in item ? item.date : item.time}
                      </span>
                      {'totalWater' in item && (
                        <>
                          <span className="text-sm font-medium">{item.totalWater.toFixed(2)}л</span>
                          <span className="text-sm font-medium">{(item.waterPerPlant).toFixed(2)}л</span>
                        </>
                      )}
                    </div>
                  ))}
                  {/* Итоговая строка с общим объемом за день */}
                  {(() => {
                    const dailyTotal = wateringSchedule.reduce((sum, item) => {
                      return sum + ('totalWater' in item ? item.totalWater : 0)
                    }, 0)
                    const dailyTotalPerPlant = dailyTotal / plantCount
                    
                    return wateringSchedule.length > 0 && wateringSchedule[0] && 'totalWater' in wateringSchedule[0] ? (
                      <div className="grid grid-cols-3 gap-2 rounded-md border-2 p-2 bg-muted/70 text-center font-semibold">
                        <span className="text-sm">{isRussian ? 'Всего за день' : 'Daily Total'}</span>
                        <span className="text-sm">{dailyTotal.toFixed(2)}л</span>
                        <span className="text-sm">{dailyTotalPerPlant.toFixed(2)}л</span>
                      </div>
                    ) : null
                  })()}
                </div>
              )}
            </div>
          </SectionCard>
        )}
      </div>

      <BottomNavigation />
    </div>
  )
}
