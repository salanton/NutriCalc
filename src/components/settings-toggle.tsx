"use client"

import { Settings } from "lucide-react"

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
import { Label } from "@radix-ui/react-label"

interface SettingsToggleProps {
  hideDescriptions: boolean
  onHideDescriptionsChange: (hide: boolean) => void
  isProMode: boolean
  onIsProModeChange: (isPro: boolean) => void
  isRussian: boolean
  onIsRussianChange: (isRussian: boolean) => void
}

export function SettingsToggle({
  hideDescriptions,
  onHideDescriptionsChange,
  isProMode,
  onIsProModeChange,
  isRussian,
  onIsRussianChange,
}: SettingsToggleProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Настройки</DropdownMenuLabel>
        <DropdownMenuSeparator />
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
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Скрыть описания
          </Label>
        </DropdownMenuItem>
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
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Про
          </Label>
        </DropdownMenuItem>
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
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Русский
          </Label>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 