import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GROWTH_STAGE_ICONS } from "@/constants/growth-stages"

interface NutrientCardProps {
  name: string
  amount: string
  perLiter: string
  stage: string
  className?: string
}

export function NutrientCard({ name, amount, perLiter, stage, className = "" }: NutrientCardProps) {
  // Extract unit from perLiter (e.g., "2.0ml" -> "ml")
  const unit = perLiter.replace(/[\d.-]/g, '').trim()
  
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{name}</CardTitle>
        <Badge variant="secondary" className="text-xs">
          {GROWTH_STAGE_ICONS[stage as keyof typeof GROWTH_STAGE_ICONS]} {stage}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{amount}{unit}</div>
        <p className="data-description mt-1">{perLiter}/L</p>
      </CardContent>
    </Card>
  )
} 