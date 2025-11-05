import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "next-themes"
import HomePage from "@/pages/HomePage"
import FertilizersPage from "@/pages/FertilizersPage"
import SettingsPage from "@/pages/SettingsPage"
import WateringPage from "@/pages/WateringPage"
import RecipePage from "@/pages/RecipePage"
import { Toaster } from "@/components/ui/sonner"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import './App.css'

function App() {
  // Получаем base path из vite.config.ts или используем дефолтный
  const basePath = import.meta.env.BASE_URL || '/'
  
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="simplexcalc-theme"
    >
      <Router basename={basePath}>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/fertilizers" element={<FertilizersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/watering" element={<WateringPage />} />
            <Route path="/recipe" element={<RecipePage />} />
          </Routes>
          <PWAInstallPrompt />
          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App