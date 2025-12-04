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
    glow: string
    textGlow: string
    iconBg: string
    description: string
  }
> = {
  CHEAPEST: {
    icon: DollarSign,
    color: "text-primary",
    bgColor: "bg-primary/5",
    borderColor: "border-primary/40",
    glow: "glow-green-hover",
    textGlow: "text-glow-green",
    iconBg: "bg-primary/20",
    description: "Maximize savings",
  },
  FASTEST: {
    icon: Clock,
    color: "text-accent",
    bgColor: "bg-accent/5",
    borderColor: "border-accent/40",
    glow: "glow-cyan-hover",
    textGlow: "text-glow-cyan",
    iconBg: "bg-accent/20",
    description: "Minimize hassle",
  },
  BALANCED: {
    icon: MapPin,
    color: "text-secondary",
    bgColor: "bg-secondary/5",
    borderColor: "border-secondary/40",
    glow: "glow-purple-hover",
    textGlow: "text-glow-purple",
    iconBg: "bg-secondary/20",
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
              "relative glass rounded-2xl border-2 p-6 text-left shadow-2xl transition-spring float-on-hover",
              config.borderColor,
              config.glow,
              isSelected
                ? `${config.bgColor} ring-2 ring-offset-2 ring-offset-[#0D0D0F]`
                : "border-border/50 hover:border-primary/30",
            )}
            style={
              isSelected
                ? {
                    ringColor: config.color.replace("text-", "var(--color-").replace(")", ""),
                  }
                : undefined
            }
          >
            {isSelected && (
              <Badge
                className={cn(
                  "absolute right-2 top-2",
                  config.iconBg,
                  config.color,
                  "border",
                  config.borderColor,
                )}
              >
                Selected
              </Badge>
            )}

            <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl shadow-lg",
                config.iconBg,
                config.glow.replace("-hover", ""),
              )}>
                <Icon className={cn("h-6 w-6", config.color)} />
              </div>
              <div>
                <span className={cn("text-xl font-bold", config.color)}>{plan.label}</span>
                <p className="text-xs text-muted-foreground">{config.description}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Total price</span>
                <span className={cn("text-3xl font-bold", config.color, config.textGlow)}>${plan.totalPrice.toFixed(2)}</span>
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

