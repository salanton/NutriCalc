import { ThemeProvider } from "next-themes"
import SimplexCalc from "@/features/simplex/SimplexCalc"
import { Toaster } from "@/components/ui/sonner"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import './App.css'

function App() {
  const handleCalculate = (results: any) => {
    console.log('Calculation results:', results)
  }

  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem 
      disableTransitionOnChange
      storageKey="simplexcalc-theme"
    >
      <div className="min-h-screen bg-background">
        <SimplexCalc 
          onCalculate={handleCalculate}
          className="max-w-7xl"
        />
        <PWAInstallPrompt />
        <Toaster />
      </div>
    </ThemeProvider>
  )
}

export default App