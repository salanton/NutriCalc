import { useState } from 'react'
import { Download, X, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePWA } from '@/hooks/usePWA'

export function PWAInstallPrompt() {
  const { canInstall, isInstalled, isStandalone, installApp } = usePWA()
  const [isVisible, setIsVisible] = useState(true)

  // Don't show if already installed or in standalone mode
  if (isInstalled || isStandalone || !canInstall || !isVisible) {
    return null
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm">Установить NutriCalc</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-xs">
          Установите приложение на домашний экран для быстрого доступа
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={installApp}
          >
            <Download className="mr-2 h-4 w-4" />
            Установить
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsVisible(false)}
          >
            Позже
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 