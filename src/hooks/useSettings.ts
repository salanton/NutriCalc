import { useState, useEffect, useCallback } from 'react'
import type { GrowthStage, GrowMethod } from '@/lib/types'

export interface AppSettings {
  // Basic settings
  growMethod: GrowMethod | ''
  growthStage: GrowthStage
  nutrientBrand: string
  selectedNutrientBrands: string[]
  waterVolume: number

  // Advanced settings
  basePh: number
  baseEc: number
  baseTemperature: number

  // Additives
  selectedAdditives: Array<{ id: string; brand: string }>
  selectedAdditiveBrands: string[]

  // Base Nutrients
  selectedBaseNutrients: Array<{ name: string; growMethod: string }>

  // UI settings
  hideDescriptions: boolean
  isProMode: boolean
  language: 'ru' | 'en' | 'fr'
  showAverageValues: boolean
  onlyRecommended: boolean
}

const DEFAULT_SETTINGS: AppSettings = {
  growMethod: '',
  growthStage: 'flower-dev',
  nutrientBrand: '',
  selectedNutrientBrands: [],
  waterVolume: 10,
  basePh: 7.5,
  baseEc: 0.4,
  baseTemperature: 18,
  selectedAdditives: [],
  selectedAdditiveBrands: [],
  selectedBaseNutrients: [],
  hideDescriptions: false,
  isProMode: false,
  language: 'ru' as const,
  showAverageValues: true,
  onlyRecommended: false,
}

const SETTINGS_KEY = 'nutricalc-settings'

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_KEY)
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings)
        // Миграция: если есть isRussian, конвертируем в language
        if (parsedSettings.isRussian !== undefined && parsedSettings.language === undefined) {
          parsedSettings.language = parsedSettings.isRussian ? 'ru' : 'en'
          delete parsedSettings.isRussian
        }
        // Don't remove nutrientBrand anymore - allow it to load properly
        // Force selectedAdditiveBrands to be empty for fresh start
        setSettings({ 
          ...DEFAULT_SETTINGS, 
          ...parsedSettings, 
          selectedAdditiveBrands: []
        })
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
      } catch (error) {
        console.warn('Failed to save settings to localStorage:', error)
      }
    }
  }, [settings, isLoaded])

  // Update specific setting
  const updateSetting = useCallback(<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }, [])

  // Update multiple settings at once
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }, [])

  // Reset to defaults
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
  }, [])

  // Clear localStorage
  const clearSettings = useCallback(() => {
    localStorage.removeItem(SETTINGS_KEY)
    setSettings(DEFAULT_SETTINGS)
  }, [])

  return {
    settings,
    isLoaded,
    updateSetting,
    updateSettings,
    resetSettings,
    clearSettings,
  }
}
