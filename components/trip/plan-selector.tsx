"use client"

import type React from "react"
import { Clock, DollarSign, MapPin, TrendingDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { PlanResponse } from "@/lib/optimizer/types"

interface PlanSelectorProps {
  plans: PlanResponse[]
  selectedPlanId: number
  onSelectPlan: (planId: number) => void
}

const strategyConfig: Record<
  string,
  {
    icon: React.ElementType
    color: string
    bgColor: string
    borderColor: string
    description: string
  }
> = {
  CHEAPEST: {
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    description: "Maximize savings",
  },
  FASTEST: {
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    description: "Minimize hassle",
  },
  BALANCED: {
    icon: MapPin,
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    description: "Good compromise",
  },
}

export function PlanSelector({ plans, selectedPlanId, onSelectPlan }: PlanSelectorProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {plans.map((plan) => {
        const config = strategyConfig[plan.strategy] || strategyConfig.BALANCED
        const Icon = config.icon
        const isSelected = plan.id === selectedPlanId

        return (
          <button
            key={plan.id}
            onClick={() => onSelectPlan(plan.id)}
            className={cn(
              "relative rounded-xl border-2 p-4 text-left transition-all hover:shadow-md",
              isSelected
                ? `${config.bgColor} ${config.borderColor} ring-2 ring-offset-2 ring-offset-background`
                : "border-border bg-card hover:border-primary/50",
            )}
            style={
              isSelected
                ? {
                    ringColor: config.color.replace("text-", ""),
                  }
                : undefined
            }
          >
            {isSelected && (
              <Badge
                className={cn(
                  "absolute right-2 top-2",
                  config.color.replace("text-", "bg-").replace("-600", "-500/20"),
                  config.color,
                )}
              >
                Selected
              </Badge>
            )}

            <div className="flex items-center gap-2">
              <Icon className={cn("h-5 w-5", config.color)} />
              <span className={cn("font-semibold", config.color)}>{plan.label}</span>
            </div>

            <p className="mt-1 text-xs text-muted-foreground">{config.description}</p>

            <div className="mt-4 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Total price</span>
                <span className="text-2xl font-bold text-foreground">${plan.totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Estimated time</span>
                <span className="font-medium text-foreground">~{Math.round(plan.estimatedTotalTimeMin)} min</span>
              </div>
            </div>

            {/* Savings badges */}
            {(plan.savingsVsWalmart || plan.savingsVsTarget || plan.savingsVsCostco) && (
              <div className="mt-3 flex flex-wrap gap-1">
                {plan.savingsVsWalmart !== null && plan.savingsVsWalmart > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <TrendingDown className="mr-1 h-3 w-3" />${plan.savingsVsWalmart.toFixed(0)} vs Walmart
                  </Badge>
                )}
                {plan.savingsVsTarget !== null && plan.savingsVsTarget > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <TrendingDown className="mr-1 h-3 w-3" />${plan.savingsVsTarget.toFixed(0)} vs Target
                  </Badge>
                )}
                {plan.savingsVsCostco !== null && plan.savingsVsCostco > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <TrendingDown className="mr-1 h-3 w-3" />${plan.savingsVsCostco.toFixed(0)} vs Costco
                  </Badge>
                )}
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

