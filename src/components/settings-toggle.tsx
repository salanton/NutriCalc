"use client"

import { Settings, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"

interface SettingsToggleProps {
  hideDescriptions: boolean
  onHideDescriptionsChange: (hide: boolean) => void
  isProMode: boolean
  onIsProModeChange: (isPro: boolean) => void
  isRussian: boolean
  onIsRussianChange: (isRussian: boolean) => void
  showAverageValues: boolean
  onShowAverageValuesChange: (show: boolean) => void
}

export function SettingsToggle({
  hideDescriptions,
  onHideDescriptionsChange,
  isProMode,
  onIsProModeChange,
  isRussian,
  onIsRussianChange,
  showAverageValues,
  onShowAverageValuesChange,
}: SettingsToggleProps) {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    if (resolvedTheme === "light") {
      setTheme("dark")
    } else {
      setTheme("light")
    }
  }

  const getThemeIcon = () => {
    if (resolvedTheme === "light") {
      return <Sun className="h-4 w-4" />
    }
    return <Moon className="h-4 w-4" />
  }

  const isDarkMode = mounted && resolvedTheme === "dark"

  return (
    <div className="fixed top-[4.5rem] right-4 md:right-[calc((100vw-2rem-1024px)/2+1rem)] z-50 pointer-events-none">
      <div className="flex justify-end pointer-events-auto items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-12 w-12 shadow-lg">
            <Settings className="h-6 w-6" />
            <span className="sr-only">Settings</span>
          </Button>
        </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Настройки</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* Theme Toggle */}
        <DropdownMenuItem
          className="flex items-center space-x-2"
          onSelect={e => e.preventDefault()}
        >
          <Switch
            id="theme-toggle"
            checked={!isDarkMode}
            onCheckedChange={toggleTheme}
          />
          <Label
            htmlFor="theme-toggle"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer ml-2 flex items-center gap-2"
          >
            {getThemeIcon()}
          </Label>
        </DropdownMenuItem>
        {/* Average Values Toggle */}
        <DropdownMenuItem
          className="flex items-center space-x-2"
          onSelect={e => e.preventDefault()}
        >
          <Switch
            id="average-values"
            checked={showAverageValues}
            onCheckedChange={onShowAverageValuesChange}
          />
          <Label
            htmlFor="average-values"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer ml-2"
          >
            Усреднить
          </Label>
        </DropdownMenuItem>
        {/* Pro Mode Toggle */}
        <DropdownMenuItem
          className="flex items-center space-x-2"
          onSelect={e => e.preventDefault()}
        >
          <Switch
            id="pro-mode"
            checked={isProMode}
            onCheckedChange={onIsProModeChange}
          />
          <Label
            htmlFor="pro-mode"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer ml-2"
          >
            Про
          </Label>
        </DropdownMenuItem>
        {/* Hide Descriptions Toggle */}
        <DropdownMenuItem
          className="flex items-center space-x-2"
          onSelect={e => e.preventDefault()}
        >
          <Switch
            id="hide-descriptions"
            checked={hideDescriptions}
            onCheckedChange={onHideDescriptionsChange}
          />
          <Label
            htmlFor="hide-descriptions"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer ml-2"
          >
            Скрыть описания
          </Label>
        </DropdownMenuItem>
        {/* Language Toggle */}
        <DropdownMenuItem
          className="flex items-center space-x-2"
          onSelect={e => e.preventDefault()}
        >
          <Switch
            id="lang-toggle"
            checked={isRussian}
            onCheckedChange={onIsRussianChange}
          />
          <Label
            htmlFor="lang-toggle"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer ml-2"
          >
            Русский
          </Label>
        </DropdownMenuItem>
      </DropdownMenuContent>
      </DropdownMenu>
      </div>
    </div>
  )
} 