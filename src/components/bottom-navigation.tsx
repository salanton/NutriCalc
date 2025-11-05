import { Link, useLocation } from "react-router-dom"
import { Calculator, TestTube2, Droplet, Settings, Home } from "lucide-react"

export function BottomNavigation() {
  const location = useLocation()
  const isHome = location.pathname === "/"
  const isFertilizers = location.pathname === "/fertilizers"
  const isRecipe = location.pathname === "/recipe"
  const isSettings = location.pathname === "/settings"
  const isWatering = location.pathname === "/watering"

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-around items-center py-3">
          <Link
            to="/"
            className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors ${
              isHome ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Основные</span>
          </Link>
          <Link
            to="/fertilizers"
            className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors ${
              isFertilizers ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <TestTube2 className="h-5 w-5" />
            <span className="text-xs">Удобрения</span>
          </Link>
          <Link
            to="/recipe"
            className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors ${
              isRecipe ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calculator className="h-6 w-6" />
            <span className="text-xs font-semibold">Рецепт</span>
          </Link>
          <Link
            to="/watering"
            className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors ${
              isWatering ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Droplet className="h-5 w-5" />
            <span className="text-xs">Полив</span>
          </Link>
          <Link
            to="/settings"
            className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors ${
              isSettings ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs">Настройки</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
