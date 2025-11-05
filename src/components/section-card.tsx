import { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface SectionCardProps {
  title: string | ReactNode
  description?: string
  icon?: LucideIcon
  iconColor?: string
  children: ReactNode
  className?: string
  hideDescriptions?: boolean
  hideDescriptionOnMobile?: boolean
  sectionNumber?: number
}

export function SectionCard({ 
  title, 
  description, 
  icon: Icon, 
  iconColor = "text-blue-500",
  children, 
  className = "", 
  hideDescriptions = false,
  hideDescriptionOnMobile = false,
  sectionNumber 
}: SectionCardProps) {
  return (
    <Card className={`border-2 transition-all duration-200 hover:shadow-lg ${className}`}>
      <CardHeader>
        {sectionNumber ? (
          <div className="flex items-start gap-3">
            <span className="inline-block w-6 h-6 rounded-full bg-primary text-primary-foreground text-center font-medium text-sm flex-shrink-0 mt-1">
              {sectionNumber}
            </span>
            <div className="flex-1">
              <CardTitle className="text-left">{title}</CardTitle>
              {!hideDescriptions && description && (
                <CardDescription className="text-left">{description}</CardDescription>
              )}
            </div>
          </div>
        ) : (
          <>
            <CardTitle className="flex items-center justify-start gap-2 text-left text-xl font-semibold">
              {Icon && <Icon className={`h-5 w-5 flex-shrink-0 ${iconColor}`} />}
              {title}
            </CardTitle>
            {!hideDescriptions && description && (
              <CardDescription className={`text-left pl-7 text-sm text-muted-foreground ${hideDescriptionOnMobile ? 'hidden md:block' : ''}`}>
                {description}
              </CardDescription>
            )}
          </>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}

