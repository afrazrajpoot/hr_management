import { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: ReactNode
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
  className?: string
  onClick?: () => void
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
  onClick
}: StatCardProps) {
  return (
    <Card 
      className={cn(
        "bg-gradient-card border-border shadow-card transition-all duration-200 hover:shadow-elevated cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="h-4 w-4 text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground mb-1">
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mb-2">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center">
            <Badge 
              variant={trend.isPositive ? "default" : "destructive"}
              className="text-xs"
            >
              {trend.isPositive ? "+" : ""}{trend.value}%
            </Badge>
            <span className="text-xs text-muted-foreground ml-2">
              {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}