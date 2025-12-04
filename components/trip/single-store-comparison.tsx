"use client"

import { Store, TrendingDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { PlanResponse } from "@/lib/optimizer/types"

interface SingleStoreComparisonProps {
  plan: PlanResponse
}

interface ChainComparison {
  chain: string
  totalPrice: number
  savings: number | null
  storeCount: number
}

export function SingleStoreComparison({ plan }: SingleStoreComparisonProps) {
  // Build comparison data
  const comparisons: ChainComparison[] = [
    {
      chain: "Walmart",
      totalPrice: plan.savingsVsWalmart !== null ? plan.totalPrice + plan.savingsVsWalmart : 0,
      savings: plan.savingsVsWalmart,
      storeCount: 1,
    },
    {
      chain: "Target",
      totalPrice: plan.savingsVsTarget !== null ? plan.totalPrice + plan.savingsVsTarget : 0,
      savings: plan.savingsVsTarget,
      storeCount: 1,
    },
    {
      chain: "Costco",
      totalPrice: plan.savingsVsCostco !== null ? plan.totalPrice + plan.savingsVsCostco : 0,
      savings: plan.savingsVsCostco,
      storeCount: 1,
    },
  ]

  // Filter to only show chains with valid data
  const validComparisons = comparisons.filter((c) => c.savings !== null)

  if (validComparisons.length === 0) {
    return null
  }

  return (
    <Card className="glass-elevated rounded-2xl shadow-2xl border-glow-green">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Store className="h-5 w-5" />
          Compare vs One Store
        </CardTitle>
        <CardDescription>See how much you save by shopping at multiple stores</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Selected plan */}
          <div className="glass-elevated rounded-2xl border-primary/50 glow-green p-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">Your selected plan</span>
                  <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/40">
                    {plan.stores.length} store{plan.stores.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{plan.label}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary text-glow-green">${plan.totalPrice.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Single-store options */}
          {validComparisons.map((comparison) => {
            const savings = comparison.savings!
            const isPositive = savings > 0
            const isNegative = savings < 0

            return (
              <div
                key={comparison.chain}
                className="glass rounded-lg p-4 float-on-hover transition-spring"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">All at {comparison.chain}</span>
                      <Badge variant="outline" className="text-xs glass border-border">
                        {comparison.storeCount} store
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xl font-bold text-foreground">${comparison.totalPrice.toFixed(2)}</p>
                    {isPositive && (
                      <p className={cn("mt-1 flex items-center justify-end gap-1 text-sm font-medium text-primary text-glow-green")}>
                        <TrendingDown className="h-3 w-3" />
                        You save ${savings.toFixed(2)}
                      </p>
                    )}
                    {isNegative && (
                      <p className="mt-1 text-sm font-medium text-destructive text-glow-pink">
                        +${Math.abs(savings).toFixed(2)} more
                      </p>
                    )}
                    {!isPositive && !isNegative && (
                      <p className="mt-1 flex items-center justify-end gap-1 text-sm font-medium text-muted-foreground">
                        You save $0.00
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

